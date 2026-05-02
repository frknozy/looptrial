/** Three lanes — survive falling hazards. */
export class LaneSwitchMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  readonly lanes = 3;

  getRoundDurationSec(): number {
    return 10;
  }

  getFallSpeed(): number {
    return Math.min(720, 380 + (this.level - 1) * 38);
  }

  getSpawnIntervalMs(): number {
    return Math.max(380, 680 - (this.level - 1) * 28);
  }

  randomLane(): number {
    return Math.floor(Math.random() * this.lanes);
  }
}
