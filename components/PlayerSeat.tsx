'use client';

import { Player } from './PokerTable';
import { PlayingCard } from './PlayingCard';

interface PlayerSeatProps {
  player: Player;
  position: number;
  totalSeats: number;
  isHero: boolean;
  isCurrentTurn: boolean;
}

export function PlayerSeat({ player, position, totalSeats, isHero, isCurrentTurn }: PlayerSeatProps) {
  // Calculate position on ellipse
  const angle = (position / totalSeats) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 45; // percentage
  const radiusY = 38; // percentage
  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 + radiusY * Math.sin(angle);

  if (player.status === 'empty') {
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-black bg-opacity-30">
          <span className="text-gray-600 text-xs">Empty</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Cards */}
        {isHero && player.cards && (
          <div className="flex gap-1 mb-1">
            <PlayingCard card={player.cards[0]} faceUp={true} size="sm" />
            <PlayingCard card={player.cards[1]} faceUp={true} size="sm" />
          </div>
        )}
        {!isHero && player.status === 'active' && (
          <div className="flex gap-1 mb-1">
            <PlayingCard card={0} faceUp={false} size="sm" />
            <PlayingCard card={0} faceUp={false} size="sm" />
          </div>
        )}

        {/* Player Info */}
        <div
          className={`
            relative px-4 py-2 rounded-lg min-w-[100px]
            ${isCurrentTurn ? 'bg-primary text-text-dark ring-2 ring-accent' : 'bg-surface'}
            ${player.status === 'folded' ? 'opacity-50' : ''}
            transition-all duration-base ease-custom
          `}
        >
          {/* Dealer/Blind Indicators */}
          {player.isDealer && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-text-dark rounded-full flex items-center justify-center text-xs font-bold">
              D
            </div>
          )}
          {player.isSmallBlind && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              SB
            </div>
          )}
          {player.isBigBlind && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              BB
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-semibold truncate">{player.nickname}</p>
            <p className="text-xs text-gray-400">{player.chips} B402</p>
          </div>
        </div>

        {/* Current Bet */}
        {player.bet > 0 && (
          <div className="bg-accent text-text-dark px-3 py-1 rounded-full text-xs font-bold">
            {player.bet}
          </div>
        )}
      </div>
    </div>
  );
}
