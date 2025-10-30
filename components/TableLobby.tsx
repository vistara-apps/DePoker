'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { DepositModal } from './DepositModal';

interface TableInfo {
  id: number;
  name: string;
  players: number;
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
}

export function TableLobby() {
  const { isConnected } = useAccount();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  const tables: TableInfo[] = [
    {
      id: 1,
      name: 'Micro Stakes',
      players: 3,
      maxPlayers: 9,
      smallBlind: 1,
      bigBlind: 2,
      minBuyIn: 40,
      maxBuyIn: 200,
    },
    {
      id: 2,
      name: 'Low Stakes',
      players: 5,
      maxPlayers: 9,
      smallBlind: 5,
      bigBlind: 10,
      minBuyIn: 200,
      maxBuyIn: 1000,
    },
    {
      id: 3,
      name: 'Mid Stakes',
      players: 2,
      maxPlayers: 9,
      smallBlind: 25,
      bigBlind: 50,
      minBuyIn: 1000,
      maxBuyIn: 5000,
    },
  ];

  const handleJoinTable = (table: TableInfo) => {
    if (!isConnected) return;
    setSelectedTable(table);
    setShowDepositModal(true);
  };

  return (
    <>
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Table Lobby</h2>
        
        <div className="space-y-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-bg rounded-lg p-4 border border-gray-800 hover:border-primary transition-colors duration-base cursor-pointer"
              onClick={() => handleJoinTable(table)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{table.name}</h3>
                <span className="text-sm text-gray-400">
                  {table.players}/{table.maxPlayers}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Blinds</p>
                  <p className="font-semibold text-primary">
                    {table.smallBlind}/{table.bigBlind}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Buy-in</p>
                  <p className="font-semibold">
                    {table.minBuyIn}-{table.maxBuyIn}
                  </p>
                </div>
              </div>

              {!isConnected && (
                <p className="text-xs text-gray-500 mt-2">Connect wallet to join</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-bg rounded-lg border border-gray-800">
          <h3 className="font-semibold mb-2 text-sm text-primary">Features</h3>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>✓ Provably fair shuffling</li>
            <li>✓ Instant B402 settlements</li>
            <li>✓ Zero gas fees for players</li>
            <li>✓ Verifiable on-chain</li>
          </ul>
        </div>
      </div>

      {showDepositModal && selectedTable && (
        <DepositModal
          table={selectedTable}
          onClose={() => setShowDepositModal(false)}
        />
      )}
    </>
  );
}
