'use client';

import { useState } from 'react';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { ActionButtons } from './ActionButtons';
import { PotDisplay } from './PotDisplay';
import { useAccount } from 'wagmi';

export type PlayerStatus = 'empty' | 'waiting' | 'active' | 'folded' | 'allin';
export type GameState = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface Player {
  address: string;
  nickname: string;
  chips: number;
  bet: number;
  status: PlayerStatus;
  cards?: [number, number];
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}

export function PokerTable() {
  const { address, isConnected } = useAccount();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  
  // Mock players for demonstration
  const [players, setPlayers] = useState<Player[]>([
    {
      address: address || '0x0',
      nickname: 'You',
      chips: 1000,
      bet: 0,
      status: isConnected ? 'active' : 'empty',
      cards: [1, 14], // Ace of Spades, Ace of Hearts
      isDealer: true,
    },
    {
      address: '0x1',
      nickname: 'Player 2',
      chips: 850,
      bet: 20,
      status: 'active',
      isSmallBlind: true,
    },
    {
      address: '0x2',
      nickname: 'Player 3',
      chips: 1200,
      bet: 40,
      status: 'active',
      isBigBlind: true,
    },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
    { address: '', nickname: '', chips: 0, bet: 0, status: 'empty' },
  ]);

  const communityCards = gameState === 'waiting' ? [] : [13, 12, 11, 10, 9]; // K, Q, J, 10, 9 of Spades

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="relative">
        {/* Poker Table Felt */}
        <div className="relative bg-gradient-to-br from-green-900 to-green-950 rounded-full aspect-[16/10] border-8 border-amber-900 shadow-inset">
          {/* Table Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center opacity-20">
              <div className="text-6xl mb-2">♠</div>
              <div className="text-2xl font-bold text-amber-500">DePoker Pro</div>
            </div>
          </div>

          {/* Community Cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CommunityCards cards={communityCards} gameState={gameState} />
          </div>

          {/* Pot Display */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20">
            <PotDisplay amount={pot + players.reduce((sum, p) => sum + p.bet, 0)} />
          </div>

          {/* Player Seats */}
          <div className="absolute inset-0">
            {players.map((player, index) => (
              <PlayerSeat
                key={index}
                player={player}
                position={index}
                totalSeats={9}
                isHero={player.address === address}
                isCurrentTurn={index === 0 && gameState !== 'waiting'}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {isConnected && gameState !== 'waiting' && (
          <div className="mt-6">
            <ActionButtons
              currentBet={currentBet}
              playerChips={players[0]?.chips || 0}
              onAction={(action, amount) => {
                console.log('Action:', action, amount);
              }}
            />
          </div>
        )}

        {/* Waiting State */}
        {!isConnected && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">Connect your wallet to join the table</p>
          </div>
        )}
      </div>
    </div>
  );
}
