'use client';

interface PotDisplayProps {
  amount: number;
}

export function PotDisplay({ amount }: PotDisplayProps) {
  if (amount === 0) return null;

  return (
    <div className="bg-amber-900 bg-opacity-90 px-6 py-3 rounded-full border-2 border-amber-700 shadow-lg">
      <div className="text-center">
        <p className="text-xs text-amber-300 font-semibold">POT</p>
        <p className="text-2xl font-bold text-amber-100">{amount}</p>
      </div>
    </div>
  );
}
