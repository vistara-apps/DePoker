# DePoker Pro - Autonomous Poker Game System

End-to-end production-ready poker game system with provably fair dealing, automated settlement, and LLM-powered player agents.

## Architecture

- **Dealer**: Deals cards using public seed, manages game state, calls player agents
- **Player Agents**: 9 isolated containers (Zara rooms) with LLM-powered decision making
- **Facilitator**: Computes net positions, builds EIP-712 authorizations, submits on-chain settlements
- **TableEscrow**: Solidity contract for secure fund handling (negatives ? escrow ? positives)

## Features

- ? Provably fair dealing (public seed, reproducible)
- ? Per-hand settlement via EIP-712 transfer authorizations
- ? Isolated player agents (no collusion)
- ? Configurable pot size (default $10)
- ? Automated game loop
- ? LLM integration via Zara API

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration:
# - RELAYER_PRIVATE_KEY (facilitator wallet)
# - TOKEN_ADDRESS (USDC on BSC)
# - Player addresses and keys
# - Zara API keys (optional)
```

### 3. Deploy TableEscrow Contract

```bash
# Set PRIVATE_KEY and RPC_URL in .env
npx hardhat deploy --network bsc --tags TableEscrow
# Copy ESCROW_ADDRESS to .env
```

### 4. Run Services

#### Option A: Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Option B: Local Development

```bash
# Terminal 1: Facilitator
npm run facilitator

# Terminal 2-N: Player agents (9 instances)
PLAYER_ID=0 npm run player
PLAYER_ID=1 npm run player
# ... repeat for all 9 players

# Terminal 10: Dealer
npm run dealer
```

### 5. Monitor Game

- Dealer status: http://localhost:3000/status
- Facilitator health: http://localhost:3002/health
- View logs: `docker-compose logs -f`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POT_SIZE_USD` | Pot size per hand | `10` |
| `RAKE_BPS` | Rake in basis points | `500` (5%) |
| `MAX_HANDS` | Maximum hands per game | `1000` |
| `PLAYER_COUNT` | Number of players | `9` |
| `CHAIN_ID` | Blockchain chain ID | `56` (BSC) |
| `TOKEN_ADDRESS` | USDC token address | Required |
| `ESCROW_ADDRESS` | TableEscrow contract address | Required |
| `RELAYER_PRIVATE_KEY` | Facilitator wallet key | Required |

### Player Configuration

Each player needs:
- `PLAYER_{N}_ADDRESS`: Ethereum address
- `PLAYER_KEY_{address}`: Private key for signing transfers
- `ZARA_API_KEY_{N}`: (Optional) Zara API key for LLM
- `ZARA_ROOM_ID_{N}`: (Optional) Zara room ID

## Game Flow

1. **Dealer** deals hand using public seed (reproducible)
2. **Dealer** calls each player agent via HTTP POST `/act` with observation
3. **Player agents** respond with action (`fold`, `call`, `raise:X`)
4. **Dealer** processes actions and advances game state
5. **Dealer** computes final payouts and creates HandReceipt
6. **Facilitator** computes net positions (negatives vs positives)
7. **Facilitator** builds EIP-712 authorizations for net negatives
8. **Facilitator** submits multicall: collect negatives ? escrow ? pay positives
9. **TableEscrow** emits `Settled` event with receipt hash

## Security Features

- **Public RNG**: Provable deck using tournament seed
- **Action Log**: Merkle root of all actions (replayable)
- **Isolated Containers**: No cross-process communication
- **Session Keys**: Pre-authorized with caps/expiry
- **Escrow Pattern**: Prevents N?N transfers

## Contract Deployment

```bash
# Deploy to BSC Testnet
npx hardhat deploy --network bscTestnet --tags TableEscrow

# Deploy to BSC Mainnet
npx hardhat deploy --network bsc --tags TableEscrow
```

## Monitoring

### Hand Receipts

Each hand generates a `HandReceipt` with:
- Table ID
- Hand number
- RNG seed
- Player addresses
- Actions merkle root
- Deltas (payments)
- Timestamp

### Settlement Events

The `TableEscrow` contract emits:
- `PaidIn(address indexed from, uint256 amount)`
- `PaidOut(address indexed to, uint256 amount)`
- `Settled(uint256 indexed handNo, bytes32 receiptHash, bytes32 txHash)`

## Development

### Project Structure

```
.
??? contracts/          # Solidity contracts
?   ??? TableEscrow.sol
??? lib/               # Shared utilities
?   ??? eip712.ts      # EIP-712 types
?   ??? types.ts       # TypeScript types
?   ??? hash.ts        # Receipt hashing
?   ??? config.ts      # Configuration
?   ??? game.ts        # Poker game engine
??? services/          # Backend services
?   ??? dealer/        # Dealer service
?   ??? facilitator/   # Settlement service
?   ??? player/        # Player agent service
??? scripts/           # Deployment scripts
```

### Adding Custom Player Strategies

Edit `services/player/index.ts` to implement custom decision logic:

```typescript
async function decideAction(obs: GameObservation): Promise<PlayerAction> {
  // Your custom strategy here
  // Call LLM, use ML model, etc.
}
```

## Troubleshooting

### Player agents not responding
- Check player endpoints are accessible
- Verify `PLAYER_{N}_ENDPOINT` URLs
- Check timeout settings

### Settlement failures
- Verify `RELAYER_PRIVATE_KEY` has BNB for gas
- Check `TOKEN_ADDRESS` supports EIP-3009
- Verify player wallets have sufficient balance

### Hand receipts not matching
- Ensure consistent `TOURNAMENT_SEED`
- Verify RNG implementation matches across replays

## License

MIT
