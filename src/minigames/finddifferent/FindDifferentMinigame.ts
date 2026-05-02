/** Four tiles — one differs; player picks the odd one. */
export class FindDifferentMinigame {
  oddIndex = 0;

  resetRound(): void {
    this.oddIndex = Math.floor(Math.random() * 4);
  }
}
