import { useWalletClient } from "wagmi";
import { useCallback } from "react";
import { ethers } from "ethers";

export function useB402Payment() {
  const { data: walletClient } = useWalletClient();

  const pay = useCallback(async ({ amount, recipientAddress }: { amount: string; recipientAddress: string }) => {
    if (!walletClient?.account) throw new Error("Wallet not connected");

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const amountBigInt = ethers.parseUnits(amount, 18);

    const USD1 = '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d';
    const RELAYER = '0xE1C2830d5DDd6B49E9c46EbE03a98Cb44CD8eA5a';
    const FACILITATOR = 'https://facilitator.b402.ai';

    // Authorization for EIP-712 signing (with BigInt)
    const authorizationForSigning = {
      from: await signer.getAddress(),
      to: recipientAddress,
      value: amountBigInt,
      validAfter: Math.floor(Date.now() / 1000),
      validBefore: Math.floor(Date.now() / 1000) + 3600,
      nonce: ethers.hexlify(ethers.randomBytes(32))
    };

    const signature = await signer.signTypedData(
      { name: 'B402', version: '1', chainId: 56, verifyingContract: RELAYER },
      {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      },
      authorizationForSigning
    );

    // Authorization for JSON (with string value)
    const authorization = {
      from: authorizationForSigning.from,
      to: authorizationForSigning.to,
      value: amountBigInt.toString(),
      validAfter: authorizationForSigning.validAfter,
      validBefore: authorizationForSigning.validBefore,
      nonce: authorizationForSigning.nonce
    };

    const payload = {
      x402Version: 1,
      scheme: 'exact',
      network: 'bsc',
      token: USD1,
      payload: { authorization, signature }
    };

    const requirements = {
      scheme: 'exact',
      network: 'bsc',
      asset: USD1,
      payTo: recipientAddress,
      maxAmountRequired: authorization.value,
      maxTimeoutSeconds: 600,
      relayerContract: RELAYER
    };

    const verify = await fetch(`${FACILITATOR}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload: payload, paymentRequirements: requirements })
    }).then(r => r.json());

    if (!verify.isValid) throw new Error(verify.invalidReason);

    const settle = await fetch(`${FACILITATOR}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload: payload, paymentRequirements: requirements })
    }).then(r => r.json());

    if (!settle.success) throw new Error(settle.errorReason);

    return { txHash: settle.transaction };
  }, [walletClient]);

  return { pay };
}
