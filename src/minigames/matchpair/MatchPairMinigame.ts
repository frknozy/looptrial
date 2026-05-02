/** Four tiles, two pairs — flip two matching symbols. */
export class MatchPairMinigame {
  readonly symbols = ["◆", "●"];

  /** Length 4: two pairs shuffled. */
  deal(): string[] {
    const deck = [this.symbols[0], this.symbols[0], this.symbols[1], this.symbols[1]];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}
