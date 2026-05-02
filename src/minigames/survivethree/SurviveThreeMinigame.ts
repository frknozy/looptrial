/** Chaotic red bullets — survive three seconds. */
export class SurviveThreeMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getDurationSec(): number {
    return 3;
  }

  getPlayerSpeed(): number {
    return 300 + (this.level - 1) * 15;
  }

  getBulletSpeed(): number {
    return Math.min(380, 200 + (this.level - 1) * 16);
  }

  getSpawnIntervalMs(): number {
    return Math.max(280, 520 - (this.level - 1) * 22);
  }

  getPlayerRadius(): number {
    return 11;
  }

  getBulletRadius(): number {
    return 9;
  }
}
