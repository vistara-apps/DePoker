'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

const B402_TOKEN_ADDRESS = '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d';

export function TokenBalance() {
  const { address } = useAccount();
  
  const { data: b402Balance } = useBalance({
    address: address,
    token: B402_TOKEN_ADDRESS as `0x${string}`,
  });

  const { data: bnbBalance } = useBalance({
    address: address,
  });

  return (
    <div className="flex items-center gap-4 bg-bg px-4 py-2 rounded-lg border border-gray-800">
      <div className="text-right">
        <p className="text-xs text-gray-400">B402</p>
        <p className="text-sm font-semibold text-primary">
          {b402Balance ? parseFloat(formatUnits(b402Balance.value, b402Balance.decimals)).toFixed(2) : '0.00'}
        </p>
      </div>
      <div className="w-px h-8 bg-gray-800" />
      <div className="text-right">
        <p className="text-xs text-gray-400">BNB</p>
        <p className="text-sm font-semibold">
          {bnbBalance ? parseFloat(formatUnits(bnbBalance.value, bnbBalance.decimals)).toFixed(4) : '0.0000'}
        </p>
      </div>
    </div>
  );
}
