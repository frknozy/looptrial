/** N/E/S/W sectors — pick the named direction. */
export class AimDirectionMinigame {
  readonly labels = ["N", "E", "S", "W"] as const;
  targetIndex = 0;

  resetRound(): void {
    this.targetIndex = Math.floor(Math.random() * 4);
  }

  getLabel(): string {
    return this.labels[this.targetIndex];
  }
}
