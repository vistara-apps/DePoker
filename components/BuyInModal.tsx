'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useB402Payment } from '@/hooks/useB402Payment';

interface BuyInModalProps {
  minBuyIn: number;
  maxBuyIn: number;
  onBuyIn: (amount: number) => void;
  onClose: () => void;
}

export function BuyInModal({ minBuyIn, maxBuyIn, onBuyIn, onClose }: BuyInModalProps) {
  const [amount, setAmount] = useState(minBuyIn);
  const [isProcessing, setIsProcessing] = useState(false);
  const { pay } = useB402Payment();

  const handleBuyIn = async () => {
    setIsProcessing(true);
    try {
      // In production, this would be the table contract address
      const tableAddress = '0xa23beff60ad1b91f35e91476475f9e3eba0897d7';
      
      await pay({
        amount: amount.toString(),
        recipientAddress: tableAddress
      });
      
      onBuyIn(amount);
    } catch (error) {
      console.error('Buy-in failed:', error);
      alert('Buy-in failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg border border-gray-800 max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Buy-In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Amount (b402 tokens)
            </label>
            <input
              type="number"
              min={minBuyIn}
              max={maxBuyIn}
              step={0.1}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full bg-bg border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Min: {minBuyIn} b402</span>
              <span>Max: {maxBuyIn} b402</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setAmount(minBuyIn)}
              className="bg-bg hover:bg-gray-700 text-gray-300 py-2 rounded transition-all duration-fast"
            >
              Min
            </button>
            <button
              onClick={() => setAmount(minBuyIn * 5)}
              className="bg-bg hover:bg-gray-700 text-gray-300 py-2 rounded transition-all duration-fast"
            >
              5x
            </button>
            <button
              onClick={() => setAmount(minBuyIn * 10)}
              className="bg-bg hover:bg-gray-700 text-gray-300 py-2 rounded transition-all duration-fast"
            >
              10x
            </button>
            <button
              onClick={() => setAmount(maxBuyIn)}
              className="bg-bg hover:bg-gray-700 text-gray-300 py-2 rounded transition-all duration-fast"
            >
              Max
            </button>
          </div>

          <div className="bg-bg/50 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Buy-in Amount:</span>
              <span className="text-white font-semibold">{amount.toFixed(3)} b402</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Gas Fee:</span>
              <span className="text-success font-semibold">FREE (B402)</span>
            </div>
          </div>

          <button
            onClick={handleBuyIn}
            disabled={isProcessing || amount < minBuyIn || amount > maxBuyIn}
            className="w-full bg-primary hover:bg-accent disabled:bg-gray-700 disabled:text-gray-500 text-text-dark font-bold py-4 rounded-lg transition-all duration-base shadow-card disabled:shadow-none"
          >
            {isProcessing ? 'Processing...' : 'Confirm Buy-In'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Using B402 gasless payments - you pay zero gas fees!
          </p>
        </div>
      </div>
    </div>
  );
}
