/** Tiny hit zone — click before timeout. */
export class SmallTargetMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getRadius(): number {
    return Math.max(9, 22 - (this.level - 1) * 1.2);
  }

  getTimeLimitMs(): number {
    return Math.max(1800, 4200 - (this.level - 1) * 220);
  }

  randomPos(margin: number, w: number, h: number): { x: number; y: number } {
    return {
      x: margin + Math.random() * (w - margin * 2),
      y: margin + Math.random() * (h - margin * 2)
    };
  }
}
