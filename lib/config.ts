/**
 * Configuration for the poker table
 */

export interface TableConfig {
  tableId: string;
  potSizeUsd: number; // default $10
  rakeBps: number; // rake in basis points (e.g., 500 = 5%)
  maxHands: number;
  playerCount: number; // 9 players
  startingStack: number; // in USD
  smallBlind: number;
  bigBlind: number;
  chainId: number;
  tokenAddress: string; // USDC address
  escrowAddress: string;
  facilitatorAddress: string;
  rpcUrl: string;
}

export const DEFAULT_CONFIG: Partial<TableConfig> = {
  potSizeUsd: 10,
  rakeBps: 500, // 5%
  maxHands: 1000,
  playerCount: 9,
  startingStack: 1000,
  smallBlind: 5,
  bigBlind: 10,
  chainId: 56, // BSC mainnet
};

export function loadConfig(): TableConfig {
  const config: TableConfig = {
    tableId: process.env.TABLE_ID || crypto.randomUUID(),
    potSizeUsd: parseFloat(process.env.POT_SIZE_USD || "10"),
    rakeBps: parseInt(process.env.RAKE_BPS || "500"),
    maxHands: parseInt(process.env.MAX_HANDS || "1000"),
    playerCount: parseInt(process.env.PLAYER_COUNT || "9"),
    startingStack: parseFloat(process.env.STARTING_STACK || "1000"),
    smallBlind: parseFloat(process.env.SMALL_BLIND || "5"),
    bigBlind: parseFloat(process.env.BIG_BLIND || "10"),
    chainId: parseInt(process.env.CHAIN_ID || "56"),
    tokenAddress: process.env.TOKEN_ADDRESS || "",
    escrowAddress: process.env.ESCROW_ADDRESS || "",
    facilitatorAddress: process.env.FACILITATOR_ADDRESS || "",
    rpcUrl: process.env.RPC_URL || "https://bsc-dataseed1.binance.org/",
  };

  // Allow running without contract deployment (off-chain mode)
  if (!config.tokenAddress || !config.escrowAddress || !config.facilitatorAddress) {
    console.warn("??  Running in OFF-CHAIN mode: Contract addresses not configured");
    console.warn("   Settlement will be simulated. Set TOKEN_ADDRESS, ESCROW_ADDRESS, FACILITATOR_ADDRESS for on-chain mode");
  }

  return config;
}
