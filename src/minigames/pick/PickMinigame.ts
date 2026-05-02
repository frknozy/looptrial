/** QuickPick — choose the highlighted lane before time runs out. */
export class PickMinigame {
  private level = 1;
  readonly laneCount = 3;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getTimeLimitMs(): number {
    return Math.max(1400, 2600 - (this.level - 1) * 110);
  }

  pickWinnerIndex(): number {
    return Math.floor(Math.random() * this.laneCount);
  }
}
