/**
 * Hand receipt hashing utilities
 */

import { keccak256, toUtf8Bytes } from "ethers";
import { HandReceipt } from "./types";

export function hashReceipt(receipt: HandReceipt): string {
  // Sort keys for deterministic hashing
  const sorted = Object.keys(receipt).sort();
  const canonical = JSON.stringify(receipt, sorted);
  return keccak256(toUtf8Bytes(canonical));
}

/**
 * Generate merkle root from actions (simplified - in production use proper Merkle tree)
 */
export function computeActionsMerkleRoot(actions: string[]): string {
  const combined = actions.join("|");
  return keccak256(toUtf8Bytes(combined));
}
