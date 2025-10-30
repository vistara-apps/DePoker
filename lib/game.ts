/**
 * Poker game engine and dealer logic
 */

import { HandReceipt, GameObservation, PlayerAction } from "./types";
import { computeActionsMerkleRoot } from "./hash";
import { TableConfig } from "./config";

export type Card = string; // "As", "Kh", "2c", etc.
export type Seat = {
  address: string;
  stack: number;
  holeCards: Card[];
  folded: boolean;
  currentBet: number;
  totalContributed: number;
};

export class PokerDealer {
  private deck: Card[] = [];
  private seats: Seat[] = [];
  private communityCards: Card[] = [];
  private pot: number = 0;
  private currentBet: number = 0;
  private dealerButton: number = 0;
  private street: "preflop" | "flop" | "turn" | "river" = "preflop";
  private actions: string[] = [];
  private handNo: number = 0;

  constructor(private config: TableConfig) {
    this.initializeSeats();
  }

  private initializeSeats() {
    this.seats = Array.from({ length: this.config.playerCount }, (_, i) => ({
      address: `player_${i}`,
      stack: this.config.startingStack,
      holeCards: [],
      folded: false,
      currentBet: 0,
      totalContributed: 0,
    }));
  }

  /**
   * Initialize deck from seed (reproducible)
   */
  private initializeDeck(seed: string): Card[] {
    const suits = ["s", "h", "d", "c"];
    const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
    const deck: Card[] = [];

    for (const rank of ranks) {
      for (const suit of suits) {
        deck.push(`${rank}${suit}`);
      }
    }

    // Simple seeded shuffle (use better RNG in production)
    return this.seededShuffle(deck, seed);
  }

  private seededShuffle<T>(array: T[], seed: string): T[] {
    const shuffled = [...array];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      hash = ((hash << 5) - hash + i) | 0;
      const j = Math.abs(hash) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Deal a new hand
   */
  dealHand(handNo: number, rngSeed: string, playerAddresses: string[]): void {
    this.handNo = handNo;
    this.deck = this.initializeDeck(`${rngSeed}_${handNo}`);
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.street = "preflop";
    this.actions = [];
    this.dealerButton = (this.dealerButton + 1) % this.config.playerCount;

    // Update addresses
    this.seats.forEach((seat, i) => {
      seat.address = playerAddresses[i] || seat.address;
      seat.holeCards = [];
      seat.folded = false;
      seat.currentBet = 0;
      seat.totalContributed = 0;
    });

    // Deal hole cards
    for (let i = 0; i < 2; i++) {
      for (let seatIdx = 0; seatIdx < this.config.playerCount; seatIdx++) {
        this.seats[seatIdx].holeCards.push(this.deck.pop()!);
      }
    }

    // Post blinds
    const sbIdx = (this.dealerButton + 1) % this.config.playerCount;
    const bbIdx = (this.dealerButton + 2) % this.config.playerCount;
    
    this.seats[sbIdx].currentBet = this.config.smallBlind;
    this.seats[sbIdx].stack -= this.config.smallBlind;
    this.seats[sbIdx].totalContributed += this.config.smallBlind;
    
    this.seats[bbIdx].currentBet = this.config.bigBlind;
    this.seats[bbIdx].stack -= this.config.bigBlind;
    this.seats[bbIdx].totalContributed += this.config.bigBlind;
    
    this.currentBet = this.config.bigBlind;
    this.pot = this.config.smallBlind + this.config.bigBlind;
    this.actions.push(`SB:${sbIdx}`, `BB:${bbIdx}`);
  }

  /**
   * Get observation for a player
   */
  getObservation(seatIdx: number): GameObservation {
    const seat = this.seats[seatIdx];
    const positions = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "CO", "BTN"];
    const positionOffset = (seatIdx - this.dealerButton - 3 + this.config.playerCount) % this.config.playerCount;

    const legalActions: string[] = [];
    if (!seat.folded) {
      legalActions.push("fold");
      if (seat.currentBet < this.currentBet) {
        legalActions.push("call");
        legalActions.push(`raise:${this.currentBet * 2}`);
      } else {
        legalActions.push("check");
      }
    }

    return {
      handNo: this.handNo,
      seat: seatIdx,
      holeCards: seat.holeCards,
      communityCards: [...this.communityCards],
      pot: this.pot,
      bet: seat.currentBet,
      toCall: this.currentBet - seat.currentBet,
      stack: seat.stack,
      position: positions[positionOffset % positions.length] as any,
      street: this.street,
      legalActions,
    };
  }

  /**
   * Process player action
   */
  processAction(seatIdx: number, action: PlayerAction): boolean {
    const seat = this.seats[seatIdx];
    if (seat.folded) return false;

    if (action === "fold") {
      seat.folded = true;
      this.actions.push(`FOLD:${seatIdx}`);
      return true;
    }

    if (action === "call") {
      const toCall = this.currentBet - seat.currentBet;
      const amount = Math.min(toCall, seat.stack);
      seat.stack -= amount;
      seat.currentBet += amount;
      seat.totalContributed += amount;
      this.pot += amount;
      this.actions.push(`CALL:${seatIdx}:${amount}`);
      return true;
    }

    if (typeof action === "object" && "raise" in action) {
      const raiseAmount = action.raise;
      const totalBet = this.currentBet + raiseAmount;
      const amount = Math.min(totalBet - seat.currentBet, seat.stack);
      
      if (amount < this.currentBet - seat.currentBet) {
        return false; // Can't raise less than current bet
      }

      seat.stack -= amount;
      seat.currentBet += amount;
      seat.totalContributed += amount;
      this.pot += amount;
      this.currentBet = seat.currentBet;
      this.actions.push(`RAISE:${seatIdx}:${amount}`);
      return true;
    }

    return false;
  }

  /**
   * Check if betting round is complete
   */
  isBettingRoundComplete(): boolean {
    const activePlayers = this.seats.filter((s) => !s.folded);
    if (activePlayers.length <= 1) return true;

    const allEqual = activePlayers.every((s) => s.currentBet === this.currentBet);
    const actionStarted = activePlayers.some((s) => s.currentBet > 0);
    
    return allEqual && actionStarted;
  }

  /**
   * Advance to next street
   */
  nextStreet(): boolean {
    if (this.street === "preflop") {
      this.street = "flop";
      this.communityCards.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!);
      this.resetBetting();
      return true;
    } else if (this.street === "flop") {
      this.street = "turn";
      this.communityCards.push(this.deck.pop()!);
      this.resetBetting();
      return true;
    } else if (this.street === "turn") {
      this.street = "river";
      this.communityCards.push(this.deck.pop()!);
      this.resetBetting();
      return true;
    }
    return false; // Hand complete
  }

  private resetBetting() {
    this.currentBet = 0;
    this.seats.forEach((seat) => {
      if (!seat.folded) {
        seat.currentBet = 0;
      }
    });
  }

  /**
   * Compute final payouts (simplified - use proper hand evaluation in production)
   */
  computePayouts(): number[] {
    const activePlayers = this.seats.filter((s) => !s.folded);
    
    if (activePlayers.length === 1) {
      // All folded except one
      const winner = activePlayers[0];
      const winnerIdx = this.seats.indexOf(winner);
      const deltas = new Array(this.config.playerCount).fill(0);
      deltas[winnerIdx] = this.pot;
      return deltas.map((d, i) => d - this.seats[i].totalContributed);
    }

    // Simplified: winner takes all (implement proper hand ranking)
    const winnerIdx = 0; // TODO: Evaluate hands properly
    const deltas = new Array(this.config.playerCount).fill(0);
    deltas[winnerIdx] = this.pot;
    
    return deltas.map((d, i) => d - this.seats[i].totalContributed);
  }

  /**
   * Create hand receipt
   */
  createReceipt(rngSeed: string, playerAddresses: string[]): HandReceipt {
    const deltas = this.computePayouts();
    const rake = (this.pot * this.config.rakeBps) / 10000;
    const rakeAdjustedDeltas = deltas.map((d) => (d - rake / this.config.playerCount).toString());

    return {
      tableId: this.config.tableId,
      handNo: this.handNo,
      rngSeed,
      players: playerAddresses,
      actionsMerkleRoot: computeActionsMerkleRoot(this.actions),
      deltas: rakeAdjustedDeltas,
      rakeBps: this.config.rakeBps,
      ts: Math.floor(Date.now() / 1000),
    };
  }
}
