'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Table {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  smallBlind: string;
  bigBlind: string;
  minBuyIn: string;
  status: 'waiting' | 'playing';
}

const mockTables: Table[] = [
  {
    id: '1',
    name: 'Micro Stakes',
    players: 4,
    maxPlayers: 9,
    smallBlind: '0.001',
    bigBlind: '0.002',
    minBuyIn: '0.1',
    status: 'playing'
  },
  {
    id: '2',
    name: 'Low Stakes',
    players: 2,
    maxPlayers: 9,
    smallBlind: '0.01',
    bigBlind: '0.02',
    minBuyIn: '1',
    status: 'waiting'
  },
  {
    id: '3',
    name: 'Mid Stakes',
    players: 6,
    maxPlayers: 9,
    smallBlind: '0.1',
    bigBlind: '0.2',
    minBuyIn: '10',
    status: 'playing'
  },
  {
    id: '4',
    name: 'High Rollers',
    players: 1,
    maxPlayers: 9,
    smallBlind: '1',
    bigBlind: '2',
    minBuyIn: '100',
    status: 'waiting'
  }
];

export function GameLobby() {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<'all' | 'waiting' | 'playing'>('all');
  
  const filteredTables = filter === 'all' 
    ? mockTables 
    : mockTables.filter(t => t.status === filter);

  return (
    <section className="py-20 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Game Lobby</h2>
            <p className="text-gray-400">Choose your table and start playing</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-base ${
                filter === 'all'
                  ? 'bg-primary text-text-dark'
                  : 'bg-surface text-gray-400 hover:bg-gray-800'
              }`}
            >
              All Tables
            </button>
            <button
              onClick={() => setFilter('waiting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-base ${
                filter === 'waiting'
                  ? 'bg-primary text-text-dark'
                  : 'bg-surface text-gray-400 hover:bg-gray-800'
              }`}
            >
              Waiting
            </button>
            <button
              onClick={() => setFilter('playing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-base ${
                filter === 'playing'
                  ? 'bg-primary text-text-dark'
                  : 'bg-surface text-gray-400 hover:bg-gray-800'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-surface rounded-lg border border-gray-800 hover:border-primary/50 transition-all duration-base overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{table.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <UsersIcon className="w-4 h-4" />
                      <span>{table.players}/{table.maxPlayers} players</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        table.status === 'waiting' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {table.status === 'waiting' ? 'Waiting' : 'Playing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-bg/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Blinds</p>
                    <p className="text-sm font-semibold text-primary">
                      {table.smallBlind}/{table.bigBlind} b402
                    </p>
                  </div>
                  <div className="bg-bg/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Min Buy-in</p>
                    <p className="text-sm font-semibold text-accent">
                      {table.minBuyIn} b402
                    </p>
                  </div>
                </div>

                {isConnected ? (
                  <Link
                    href={`/table/${table.id}`}
                    className="block w-full bg-primary hover:bg-accent text-text-dark font-semibold py-3 rounded-lg text-center transition-all duration-base group-hover:shadow-card"
                  >
                    Join Table
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-800 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed"
                  >
                    Connect Wallet to Play
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No tables found matching your filter</p>
          </div>
        )}
      </div>
    </section>
  );
}
