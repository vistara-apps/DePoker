'use client';

import { ShieldCheckIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface to-bg py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Provably Fair No-Limit Hold'em
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Experience the future of online poker on Binance Smart Chain. 
            Verifiable shuffles, instant settlements, and zero trust required.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-primary/50 transition-all duration-base">
              <ShieldCheckIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verifiable Fairness</h3>
              <p className="text-sm text-gray-400">Cryptographically secure shuffling with Chainlink VRF</p>
            </div>
            
            <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-primary/50 transition-all duration-base">
              <BoltIcon className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Settlements</h3>
              <p className="text-sm text-gray-400">Automatic payouts with B402 gasless payments</p>
            </div>
            
            <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-primary/50 transition-all duration-base">
              <CurrencyDollarIcon className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Low Fees</h3>
              <p className="text-sm text-gray-400">Minimal rake on BSC with b402 token</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
