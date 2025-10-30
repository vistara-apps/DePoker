'use client';

import { PlayingCard } from './PlayingCard';
import { GameState } from './PokerTable';

interface CommunityCardsProps {
  cards: number[];
  gameState: GameState;
}

export function CommunityCards({ cards, gameState }: CommunityCardsProps) {
  const visibleCards = {
    waiting: 0,
    preflop: 0,
    flop: 3,
    turn: 4,
    river: 5,
    showdown: 5,
  }[gameState];

  if (visibleCards === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {cards.slice(0, visibleCards).map((card, index) => (
        <PlayingCard key={index} card={card} faceUp={true} size="md" />
      ))}
    </div>
  );
}
