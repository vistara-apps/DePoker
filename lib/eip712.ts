/**
 * EIP-712 domain and types for transferWithAuthorization (EIP-3009 style)
 */

export const domain = (chainId: number, verifyingContract: string) => ({
  name: "B402",
  version: "1",
  chainId,
  verifyingContract,
});

export const types = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

export type TransferWithAuthorizationMessage = {
  from: string;
  to: string;
  value: bigint;
  validAfter: number;
  validBefore: number;
  nonce: string;
};
