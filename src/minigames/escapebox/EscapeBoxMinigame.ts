/** Safe area shrinks — WASD to stay inside. */
export class EscapeBoxMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getShrinkPerSec(): number {
    return 22 + (this.level - 1) * 2.5;
  }

  getWinDurationSec(): number {
    return 5;
  }

  getPlayerRadius(): number {
    return 12;
  }

  initialHalfSize(w: number, h: number): number {
    return Math.min(w, h) * 0.36;
  }
}
