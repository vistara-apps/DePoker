'use client';

import { useState } from 'react';
import { useB402Payment } from '@/hooks/useB402Payment';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TableInfo {
  id: number;
  name: string;
  minBuyIn: number;
  maxBuyIn: number;
}

interface DepositModalProps {
  table: TableInfo;
  onClose: () => void;
}

export function DepositModal({ table, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState(table.minBuyIn);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { pay } = useB402Payment();

  const handleDeposit = async () => {
    if (amount < table.minBuyIn || amount > table.maxBuyIn) {
      setError(`Amount must be between ${table.minBuyIn} and ${table.maxBuyIn}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // In production, this would be the table contract address
      const tableContractAddress = '0xa23beff60ad1b91f35e91476475f9e3eba0897d7';
      
      await pay({
        amount: amount.toString(),
        recipientAddress: tableContractAddress,
      });

      // Success - close modal and join table
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-md w-full p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-primary">Join Table</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">{table.name}</h3>
          <p className="text-sm text-gray-400">
            Buy-in: {table.minBuyIn} - {table.maxBuyIn} B402
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Deposit Amount (B402)
          </label>
          <input
            type="number"
            min={table.minBuyIn}
            max={table.maxBuyIn}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-bg border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Min: {table.minBuyIn}</span>
            <span>Max: {table.maxBuyIn}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAmount(table.minBuyIn)}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
          >
            Min
          </button>
          <button
            onClick={() => setAmount(Math.floor((table.minBuyIn + table.maxBuyIn) / 2))}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
          >
            Mid
          </button>
          <button
            onClick={() => setAmount(table.maxBuyIn)}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-base"
          >
            Max
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error bg-opacity-20 border border-error rounded-lg text-sm text-error">
            {error}
          </div>
        )}

        <div className="bg-bg rounded-lg p-3 mb-4 text-sm">
          <p className="text-gray-400 mb-1">Transaction Details:</p>
          <ul className="space-y-1 text-xs">
            <li className="flex justify-between">
              <span className="text-gray-500">Deposit:</span>
              <span className="text-white">{amount} B402</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Gas Fee:</span>
              <span className="text-success">FREE (B402 Gasless)</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleDeposit}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-primary hover:bg-accent text-text-dark rounded-lg font-semibold transition-all duration-base ease-custom disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Deposit & Join Table'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Powered by B402 gasless payments on BSC
        </p>
      </div>
    </div>
  );
}
