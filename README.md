# DePoker Pro - Provably Fair Poker on BSC

A decentralized poker application built on Binance Smart Chain with provably fair gameplay and instant B402 token settlements.

## Features

- **Provably Fair Shuffling**: Cryptographically secure card dealing using Chainlink VRF
- **Instant Settlements**: Zero gas fees for players using B402 gasless payments
- **9-Player Tables**: Full No-Limit Hold'em experience
- **Transparent Gameplay**: All game state verifiable on-chain
- **Multiple Stakes**: Micro, Low, and Mid stakes tables

## Tech Stack

- Next.js 15 with App Router
- React 19
- RainbowKit for wallet connections
- Wagmi v2 + Viem v2
- Ethers.js v6
- B402 Gasless Payments
- Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## B402 Integration

This dApp uses B402 for gasless payments on BSC:
- Players pay ZERO gas fees
- Instant token settlements
- Secure EIP-712 signatures
- Facilitator handles all gas costs

## Smart Contracts

The following contracts need to be deployed:

1. **GameTable Contract**: Manages game state, player actions, and pot distribution
2. **B402 Token**: BEP20 token for in-game currency (already deployed)
3. **VRF Consumer**: Chainlink VRF integration for provably fair shuffling

## Roadmap

- [ ] Deploy smart contracts to BSC testnet
- [ ] Implement Chainlink VRF for card shuffling
- [ ] Add tournament mode
- [ ] Implement hand history and statistics
- [ ] Add private tables
- [ ] Mobile responsive improvements

## License

MIT
