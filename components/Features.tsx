'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

const features = [
  {
    title: 'Verifiable Shuffle & Deal',
    description: 'Every card shuffle is cryptographically verifiable using Chainlink VRF, ensuring complete fairness.',
    benefits: ['Tamper-proof randomness', 'Auditable game history', 'Player confidence']
  },
  {
    title: 'Secure Hand Progression',
    description: 'All game state managed on-chain with transparent bet tracking and pot management.',
    benefits: ['No server manipulation', 'Real-time verification', 'Complete transparency']
  },
  {
    title: 'Instant Settlements',
    description: 'Winnings paid out automatically using B402 gasless payments on BSC.',
    benefits: ['Zero gas fees', 'Immediate payouts', 'Low transaction costs']
  },
  {
    title: 'Tokenized Chips',
    description: 'Full control over your funds with b402 BEP20 tokens in your wallet.',
    benefits: ['True ownership', 'Easy deposits/withdrawals', 'BSC ecosystem integration']
  }
];

export function Features() {
  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why DePoker Pro?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built on cutting-edge blockchain technology to deliver the most fair and transparent poker experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-surface rounded-lg p-8 border border-gray-800 hover:border-primary/30 transition-all duration-base shadow-card"
            >
              <h3 className="text-xl font-semibold mb-3 text-primary">{feature.title}</h3>
              <p className="text-gray-300 mb-6">{feature.description}</p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, bidx) => (
                  <li key={bidx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
