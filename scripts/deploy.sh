#!/usr/bin/env bash

# Deployment script for DePoker Pro

set -e

echo "?? DePoker Pro Deployment Script"
echo "================================"

# Check for required environment variables
if [ -z "$RELAYER_PRIVATE_KEY" ]; then
    echo "? ERROR: RELAYER_PRIVATE_KEY not set"
    exit 1
fi

if [ -z "$TOKEN_ADDRESS" ]; then
    echo "? ERROR: TOKEN_ADDRESS not set"
    exit 1
fi

# Step 1: Deploy TableEscrow contract
echo ""
echo "?? Step 1: Deploying TableEscrow contract..."
FACILITATOR_ADDRESS=$(node -e "const { ethers } = require('ethers'); const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY); console.log(wallet.address)")

echo "Facilitator address: $FACILITATOR_ADDRESS"

npx hardhat deploy --network bsc --tags TableEscrow

# Get deployed address from hardhat
ESCROW_ADDRESS=$(grep "TableEscrow deployed to:" hardhat-output.log | awk '{print $NF}')

if [ -z "$ESCROW_ADDRESS" ]; then
    echo "? Failed to get escrow address"
    exit 1
fi

echo "? TableEscrow deployed at: $ESCROW_ADDRESS"

# Step 2: Update .env file
echo ""
echo "?? Step 2: Updating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
fi

sed -i.bak "s|ESCROW_ADDRESS=.*|ESCROW_ADDRESS=$ESCROW_ADDRESS|" .env
sed -i.bak "s|FACILITATOR_ADDRESS=.*|FACILITATOR_ADDRESS=$FACILITATOR_ADDRESS|" .env

echo "? Environment variables updated"

# Step 3: Build Docker images
echo ""
echo "?? Step 3: Building Docker images..."
docker-compose build

echo "? Docker images built"

# Step 4: Start services
echo ""
echo "?? Step 4: Starting services..."
echo "??  Make sure you have configured all player addresses and keys in .env"
read -p "Press enter to continue or Ctrl+C to cancel..."

docker-compose up -d

echo ""
echo "? Deployment complete!"
echo ""
echo "Services running:"
echo "  - Dealer: http://localhost:3000"
echo "  - Facilitator: http://localhost:3002"
echo "  - Player agents: http://localhost:3001 (per player)"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
