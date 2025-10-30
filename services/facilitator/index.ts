/**
 * Facilitator service - handles settlement and on-chain transactions
 */

import express from "express";
import { Wallet, Contract, ethers } from "ethers";
import { domain, types, TransferWithAuthorizationMessage } from "../../lib/eip712";
import { HandReceipt, NetPosition } from "../../lib/types";
import { hashReceipt } from "../../lib/hash";
import { TableConfig, loadConfig } from "../../lib/config";

const app = express();
app.use(express.json());

const config = loadConfig();

// Check if running in off-chain mode
const isOffChainMode = !config.tokenAddress || !config.escrowAddress || !config.facilitatorAddress;

if (isOffChainMode) {
  console.warn("??  Running in OFF-CHAIN mode - settlements will be simulated");
} else {
  // Provider and relayer wallet
  provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
  if (!process.env.RELAYER_PRIVATE_KEY) {
    throw new Error("RELAYER_PRIVATE_KEY required for on-chain mode");
  }
  
  relayer = new Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
  
  // Contract ABIs (simplified - use proper ABIs in production)
  ESCROW_ABI = [
    "function batchDebit(address[] calldata recipients, uint256[] calldata amounts) external",
    "function emitSettled(uint256 handNo, bytes32 receiptHash, bytes32 txHash) external",
  ];
  
  TOKEN_ABI = [
    "function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external",
  ];
  
  // Player wallet cache (session keys)
  playerWallets = new Map<string, Wallet>();
  
  /**
   * Get or create wallet for a player address
   * In production, these would be pre-signed session keys
   */
  function getPlayerWallet(address: string): Wallet {
    if (!playerWallets.has(address)) {
      // In production, load from secure storage or use pre-signed authorizations
      const privateKey = process.env[`PLAYER_KEY_${address}`] || ethers.Wallet.createRandom().privateKey;
      playerWallets.set(address, new Wallet(privateKey, provider));
    }
    return playerWallets.get(address)!;
  }
  
  /**
   * Settle a single hand
   */
  async function settleHand({
    receipt,
    receiptHash,
    negatives,
    positives,
  }: {
    receipt: HandReceipt;
    receiptHash: string;
    negatives: NetPosition[];
    positives: NetPosition[];
  }): Promise<string> {
    if (!relayer || !provider) {
      throw new Error("Relayer not initialized");
    }
    
    console.log(`Settling hand ${receipt.handNo}, receipt hash: ${receiptHash}`);
  
    const now = Math.floor(Date.now() / 1000);
    const validAfter = now - 60;
    const validBefore = now + 300; // 5 min validity
  
    const escrowContract = new Contract(config.escrowAddress, ESCROW_ABI, relayer);
    const tokenContract = new Contract(config.tokenAddress, TOKEN_ABI, relayer);
  
    // Step 1: Collect from negatives via transferWithAuthorization
    const transferTxns: Promise<any>[] = [];
  
    for (const neg of negatives) {
      const playerWallet = getPlayerWallet(neg.address);
      const nonce = ethers.keccak256(
        ethers.toUtf8Bytes(`${receipt.tableId}_${receipt.handNo}_${neg.address}`)
      );
      const value = ethers.parseUnits(neg.amount.toString(), 6); // USDC decimals
  
      const message: TransferWithAuthorizationMessage = {
        from: neg.address,
        to: config.escrowAddress,
        value: BigInt(value.toString()),
        validAfter,
        validBefore,
        nonce,
      };
  
      // Sign authorization
      const signature = await playerWallet.signTypedData(
        domain(config.chainId, config.tokenAddress),
        types,
        message
      );
  
      // Split signature
      const sig = ethers.Signature.from(signature);
  
      // Call transferWithAuthorization
      const tx = await tokenContract.transferWithAuthorization(
        neg.address,
        config.escrowAddress,
        value,
        validAfter,
        validBefore,
        nonce,
        sig.v,
        sig.r,
        sig.s
      );
  
      transferTxns.push(tx.wait());
    }
  
    // Wait for all transfers
    await Promise.all(transferTxns);
  
    // Step 2: Credit escrow (in production, read balance deltas)
    // For now, we assume transfers go directly to escrow balance
  
    // Step 3: Pay winners
    if (positives.length > 0) {
      const recipients = positives.map((p) => p.address);
      const amounts = positives.map((p) => ethers.parseUnits(p.amount.toString(), 6));
  
      const debitTx = await escrowContract.batchDebit(recipients, amounts);
      await debitTx.wait();
    }
  
    // Step 4: Emit settlement event
    const receiptHashBytes = ethers.keccak256(ethers.toUtf8Bytes(receiptHash));
    const txHash = await escrowContract.emitSettled(
      receipt.handNo,
      receiptHashBytes,
      ethers.ZeroHash // Will be updated with actual tx hash
    );
  
    const receiptTx = await txHash.wait();
    const finalTxHash = receiptTx.hash;
  
    console.log(`Hand ${receipt.handNo} settled. TX: ${finalTxHash}`);
  
    return finalTxHash;
  }
}

// HTTP endpoints
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    address: isOffChainMode ? "off-chain-mode" : (relayer?.address || "unknown"),
    mode: isOffChainMode ? "off-chain" : "on-chain"
  });
});

app.post("/settle-hand", async (req, res) => {
  try {
    const { receipt, receiptHash, negatives, positives } = req.body;

    // Verify receipt hash
    const computedHash = hashReceipt(receipt);
    if (computedHash !== receiptHash) {
      return res.status(400).json({ error: "Receipt hash mismatch" });
    }

    if (isOffChainMode) {
      // Simulate settlement in off-chain mode
      console.log(`[OFF-CHAIN] Simulating settlement for hand ${receipt.handNo}`);
      console.log(`Receipt hash: ${receiptHash}`);
      console.log(`Negatives: ${negatives.length} players`);
      console.log(`Positives: ${positives.length} players`);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.json({
        success: true,
        txHash: `simulated_${receiptHash.slice(0, 16)}`,
        receiptHash,
        mode: "off-chain",
      });
    }

    const txHash = await settleHand({ receipt, receiptHash, negatives, positives });

    res.json({
      success: true,
      txHash,
      receiptHash,
      mode: "on-chain",
    });
  } catch (error: any) {
    console.error("Settlement error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Settlement failed",
    });
  }
});

const PORT = process.env.FACILITATOR_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Facilitator service running on port ${PORT}`);
  if (relayer) {
    console.log(`Relayer address: ${relayer.address}`);
  } else {
    console.log(`Mode: OFF-CHAIN (simulated settlements)`);
  }
});
