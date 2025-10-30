/**
 * Core types for the poker game system
 */

export type HandReceipt = {
  tableId: string; // uuid
  handNo: number;
  rngSeed: string; // public seed for this hand
  players: string[]; // addresses (one per agent)
  actionsMerkleRoot: string; // compact proof for action log
  deltas: string[]; // int256, length 9, sum = -rake
  rakeBps: number;
  ts: number;
};

export type PlayerAction = "fold" | "call" | { raise: number };

export type GameObservation = {
  handNo: number;
  seat: number;
  holeCards: string[]; // ["As", "Kh"]
  communityCards: string[];
  pot: number;
  bet: number;
  toCall: number;
  stack: number;
  position: "SB" | "BB" | "UTG" | "UTG+1" | "UTG+2" | "MP" | "MP+1" | "CO" | "BTN";
  street: "preflop" | "flop" | "turn" | "river";
  legalActions: string[];
};

export type NetPosition = {
  address: string;
  amount: number; // positive = receive, negative = pay
};

export type SettlementTx = {
  receiptHash: string;
  txHash: string;
  timestamp: number;
};
