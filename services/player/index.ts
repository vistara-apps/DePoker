/**
 * Player agent service - responds to dealer actions
 * Each agent runs in isolation (Zara room/container)
 */

import express from "express";
import { GameObservation, PlayerAction } from "../../lib/types";

const app = express();
app.use(express.json());

const PLAYER_ID = parseInt(process.env.PLAYER_ID || "0");
const ZARA_API_KEY = process.env.ZARA_API_KEY || "";
const ZARA_ROOM_ID = process.env.ZARA_ROOM_ID || "";

/**
 * Simple strategy: random actions weighted by pot odds
 * In production, this would call LLM via Zara API
 */
async function decideAction(obs: GameObservation): Promise<PlayerAction> {
  // If Zara is configured, call LLM
  if (ZARA_API_KEY && ZARA_ROOM_ID) {
    try {
      const response = await fetch(`https://api.zara.ai/v1/rooms/${ZARA_ROOM_ID}/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ZARA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `You are playing poker. Here's your situation:
Hand: ${obs.handNo}
Street: ${obs.street}
Hole cards: ${obs.holeCards.join(", ")}
Community cards: ${obs.communityCards.join(", ")}
Pot: $${obs.pot}
To call: $${obs.toCall}
Stack: $${obs.stack}
Position: ${obs.position}

Legal actions: ${obs.legalActions.join(", ")}

Respond with ONLY one action: "fold", "call", or "raise:X" where X is the raise amount.`,
          model: "gpt-4",
        }),
      });

      const data = await response.json();
      const actionStr = data.response.trim().toLowerCase();

      if (actionStr === "fold") return "fold";
      if (actionStr === "call") return "call";
      if (actionStr.startsWith("raise:")) {
        const amount = parseFloat(actionStr.split(":")[1]);
        return { raise: isNaN(amount) ? obs.toCall * 2 : amount };
      }
    } catch (error) {
      console.error("Zara API error:", error);
    }
  }

  // Fallback: simple strategy
  const potOdds = obs.toCall / (obs.pot + obs.toCall);
  const random = Math.random();

  if (random < 0.3) {
    return "fold";
  } else if (random < 0.7 || potOdds > 0.5) {
    return "call";
  } else {
    return { raise: obs.toCall * 2 };
  }
}

app.post("/act", async (req, res) => {
  try {
    const { observation }: { observation: GameObservation } = req.body;

    console.log(`Player ${PLAYER_ID} received action request for hand ${observation.handNo}`);

    const action = await decideAction(observation);

    res.json({ action });
  } catch (error: any) {
    console.error(`Player ${PLAYER_ID} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", playerId: PLAYER_ID });
});

const PORT = process.env.PLAYER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Player agent ${PLAYER_ID} running on port ${PORT}`);
});
