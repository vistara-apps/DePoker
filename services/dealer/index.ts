/**
 * Dealer service - runs poker games and coordinates with player agents
 */

import express from "express";
import { PokerDealer } from "../../lib/game";
import { TableConfig, loadConfig } from "../../lib/config";
import { HandReceipt, PlayerAction, NetPosition } from "../../lib/types";
import { hashReceipt } from "../../lib/hash";
import axios from "axios";

const app = express();
app.use(express.json());

const config = loadConfig();
const dealer = new PokerDealer(config);

// Player agent endpoints (HTTP)
const PLAYER_AGENT_BASE_URL = process.env.PLAYER_AGENT_BASE_URL || "http://localhost:3001";
const PLAYER_COUNT = config.playerCount;

// Facilitator endpoint
const FACILITATOR_URL = process.env.FACILITATOR_URL || "http://localhost:3002";

interface PlayerAgent {
  address: string;
  endpoint: string;
}

const playerAgents: PlayerAgent[] = Array.from({ length: PLAYER_COUNT }, (_, i) => ({
  address: process.env[`PLAYER_${i}_ADDRESS`] || `0x${"0".repeat(40)}`,
  endpoint: process.env[`PLAYER_${i}_ENDPOINT`] || `${PLAYER_AGENT_BASE_URL}:${3001 + i}`,
}));

/**
 * Netting: compute net positions per player
 */
function computeNetPositions(deltas: string[], addresses: string[]): {
  negatives: NetPosition[];
  positives: NetPosition[];
} {
  const negatives: NetPosition[] = [];
  const positives: NetPosition[] = [];

  deltas.forEach((deltaStr, i) => {
    const delta = parseFloat(deltaStr);
    if (delta < 0) {
      negatives.push({ address: addresses[i], amount: Math.abs(delta) });
    } else if (delta > 0) {
      positives.push({ address: addresses[i], amount: delta });
    }
  });

  return { negatives, positives };
}

/**
 * Run a single hand
 */
async function runHand(handNo: number, rngSeed: string): Promise<HandReceipt> {
  console.log(`Dealing hand ${handNo} with seed ${rngSeed}`);

  const addresses = playerAgents.map((p) => p.address);
  dealer.dealHand(handNo, rngSeed, addresses);

  // Run betting rounds
  let streetComplete = false;
  while (!streetComplete) {
    // Reset betting state for new street
    for (let seatIdx = 0; seatIdx < PLAYER_COUNT; seatIdx++) {
      const obs = dealer.getObservation(seatIdx);
      if (obs.legalActions.length > 0 && !dealer["seats"][seatIdx].folded) {
        try {
          // Call player agent
          const response = await axios.post(`${playerAgents[seatIdx].endpoint}/act`, {
            observation: obs,
          }, {
            timeout: 10000, // 10s timeout
          });

          const action: PlayerAction = response.data.action;
          dealer.processAction(seatIdx, action);

          // Check if round complete
          if (dealer.isBettingRoundComplete()) {
            if (dealer.nextStreet()) {
              streetComplete = false;
              break;
            } else {
              streetComplete = true;
              break;
            }
          }
        } catch (error) {
          console.error(`Error calling player ${seatIdx}:`, error);
          // Auto-fold on error
          dealer.processAction(seatIdx, "fold");
        }
      }
    }

    if (dealer.isBettingRoundComplete()) {
      if (dealer.nextStreet()) {
        streetComplete = false;
      } else {
        streetComplete = true;
      }
    }
  }

  // Create receipt
  const receipt = dealer.createReceipt(rngSeed, addresses);
  return receipt;
}

/**
 * Generate RNG seed (use drand or fixed tournament seed)
 */
function generateRNGSeed(handNo: number): string {
  // In production, use drand or VRF
  const tournamentSeed = process.env.TOURNAMENT_SEED || "fixed_tournament_seed_2024";
  return `${tournamentSeed}_hand_${handNo}`;
}

/**
 * Main game loop
 */
async function runGameLoop() {
  console.log(`Starting game loop for table ${config.tableId}`);
  console.log(`Pot size: $${config.potSizeUsd}, Rake: ${config.rakeBps / 100}%`);

  for (let handNo = 1; handNo <= config.maxHands; handNo++) {
    try {
      const rngSeed = generateRNGSeed(handNo);
      const receipt = await runHand(handNo, rngSeed);
      const receiptHash = hashReceipt(receipt);

      console.log(`Hand ${handNo} completed. Receipt hash: ${receiptHash}`);

      // Compute net positions
      const { negatives, positives } = computeNetPositions(receipt.deltas, receipt.players);

      // Call facilitator to settle
      try {
        const settlementResponse = await axios.post(`${FACILITATOR_URL}/settle-hand`, {
          receipt,
          receiptHash,
          negatives,
          positives,
        });

        console.log(`Hand ${handNo} settled. TX: ${settlementResponse.data.txHash}`);
      } catch (error) {
        console.error(`Settlement failed for hand ${handNo}:`, error);
        // Continue to next hand (can retry later)
      }

      // Small delay between hands
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error in hand ${handNo}:`, error);
      // Continue to next hand
    }
  }

  console.log("Game loop completed");
}

// HTTP endpoints
app.get("/health", (req, res) => {
  res.json({ status: "ok", tableId: config.tableId });
});

app.get("/status", (req, res) => {
  res.json({
    tableId: config.tableId,
    handNo: (dealer as any).handNo,
    config: {
      potSizeUsd: config.potSizeUsd,
      rakeBps: config.rakeBps,
      playerCount: config.playerCount,
    },
  });
});

app.post("/start", async (req, res) => {
  res.json({ message: "Game loop started" });
  runGameLoop().catch(console.error);
});

const PORT = process.env.DEALER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dealer service running on port ${PORT}`);
  console.log(`Table ID: ${config.tableId}`);
});

// Auto-start if requested
if (process.env.AUTO_START === "true") {
  setTimeout(() => runGameLoop(), 5000);
}
