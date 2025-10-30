'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { TokenBalance } from './TokenBalance';

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="bg-surface border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">♠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">DePoker Pro</h1>
              <p className="text-xs text-gray-400">BSC Mainnet</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && <TokenBalance />}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
