'use client';

interface PlayingCardProps {
  card: number; // 1-52 or 0 for face down
  faceUp: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ card, faceUp, size = 'md' }: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-20 h-28 text-3xl',
  };

  if (!faceUp) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-900 to-blue-950 rounded-md border-2 border-blue-800 flex items-center justify-center shadow-lg`}>
        <div className="text-blue-700 opacity-50">♠</div>
      </div>
    );
  }

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const suitIndex = Math.floor((card - 1) / 13);
  const rankIndex = (card - 1) % 13;
  const suit = suits[suitIndex];
  const rank = ranks[rankIndex];
  const isRed = suit === '♥' || suit === '♦';

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-md border-2 border-gray-300 flex flex-col items-center justify-between p-1 shadow-lg`}>
      <div className={`text-left w-full ${isRed ? 'text-red-600' : 'text-black'} font-bold`}>
        <div className="text-xs leading-none">{rank}</div>
        <div className="text-sm leading-none">{suit}</div>
      </div>
      <div className={`${isRed ? 'text-red-600' : 'text-black'}`}>
        {suit}
      </div>
      <div className={`text-right w-full ${isRed ? 'text-red-600' : 'text-black'} font-bold rotate-180`}>
        <div className="text-xs leading-none">{rank}</div>
        <div className="text-sm leading-none">{suit}</div>
      </div>
    </div>
  );
}
