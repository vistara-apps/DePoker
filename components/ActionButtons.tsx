'use client';

import { useState } from 'react';

export type PokerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

interface ActionButtonsProps {
  currentBet: number;
  playerChips: number;
  onAction: (action: PokerAction, amount?: number) => void;
}

export function ActionButtons({ currentBet, playerChips, onAction }: ActionButtonsProps) {
  const [betAmount, setBetAmount] = useState(currentBet * 2 || 20);
  const [showBetSlider, setShowBetSlider] = useState(false);

  const canCheck = currentBet === 0;
  const callAmount = currentBet;

  return (
    <div className="bg-surface rounded-lg p-4 border border-gray-800">
      <div className="flex flex-wrap gap-3">
        {/* Fold */}
        <button
          onClick={() => onAction('fold')}
          className="flex-1 min-w-[100px] px-6 py-3 bg-error hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-base ease-custom transform hover:scale-105"
        >
          Fold
        </button>

        {/* Check/Call */}
        {canCheck ? (
          <button
            onClick={() => onAction('check')}
            className="flex-1 min-w-[100px] px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-base ease-custom transform hover:scale-105"
          >
            Check
          </button>
        ) : (
          <button
            onClick={() => onAction('call', callAmount)}
            className="flex-1 min-w-[100px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-base ease-custom transform hover:scale-105"
          >
            Call {callAmount}
          </button>
        )}

        {/* Bet/Raise */}
        <button
          onClick={() => setShowBetSlider(!showBetSlider)}
          className="flex-1 min-w-[100px] px-6 py-3 bg-success hover:bg-green-500 text-white rounded-lg font-semibold transition-all duration-base ease-custom transform hover:scale-105"
        >
          {currentBet === 0 ? 'Bet' : 'Raise'}
        </button>

        {/* All In */}
        <button
          onClick={() => onAction('allin', playerChips)}
          className="flex-1 min-w-[100px] px-6 py-3 bg-primary hover:bg-accent text-text-dark rounded-lg font-semibold transition-all duration-base ease-custom transform hover:scale-105"
        >
          All In
        </button>
      </div>

      {/* Bet Amount Slider */}
      {showBetSlider && (
        <div className="mt-4 p-4 bg-bg rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Bet Amount</span>
            <span className="text-lg font-bold text-primary">{betAmount} B402</span>
          </div>
          
          <input
            type="range"
            min={currentBet * 2 || 20}
            max={playerChips}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Min: {currentBet * 2 || 20}</span>
            <span>Max: {playerChips}</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setBetAmount(Math.floor(playerChips * 0.5))}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
            >
              1/2 Pot
            </button>
            <button
              onClick={() => setBetAmount(Math.floor(playerChips * 0.75))}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
            >
              3/4 Pot
            </button>
            <button
              onClick={() => setBetAmount(playerChips)}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
            >
              Pot
            </button>
          </div>

          <button
            onClick={() => {
              onAction(currentBet === 0 ? 'bet' : 'raise', betAmount);
              setShowBetSlider(false);
            }}
            className="w-full mt-3 px-6 py-3 bg-primary hover:bg-accent text-text-dark rounded-lg font-semibold transition-all duration-base ease-custom"
          >
            Confirm {currentBet === 0 ? 'Bet' : 'Raise'}
          </button>
        </div>
      )}
    </div>
  );
}
