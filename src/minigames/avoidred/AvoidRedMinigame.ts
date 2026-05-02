/** Horizontal red bars sweep — survive with vertical movement. */
export class AvoidRedMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getRoundDurationSec(): number {
    return 5;
  }

  getPlayerSpeed(): number {
    return 260 + (this.level - 1) * 14;
  }

  getHazardSpeed(): number {
    return Math.min(520, 280 + (this.level - 1) * 22);
  }

  getSpawnIntervalMs(): number {
    return Math.max(450, 820 - (this.level - 1) * 32);
  }
}
