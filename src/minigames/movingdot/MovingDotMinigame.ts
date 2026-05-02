/** Fast dot on a Lissajous path — click to hit. */
export class MovingDotMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getRadius(): number {
    return Math.max(11, 20 - (this.level - 1));
  }

  getSpeed(): number {
    return Math.min(3.4, 1.25 + (this.level - 1) * 0.22);
  }

  getTimeLimitMs(): number {
    return Math.max(2200, 4800 - (this.level - 1) * 240);
  }

  pos(
    tMs: number,
    cx: number,
    cy: number,
    ampX: number,
    ampY: number
  ): { x: number; y: number } {
    const s = this.getSpeed();
    const t = tMs * 0.001 * s;
    return {
      x: cx + Math.sin(t * 2.4) * ampX,
      y: cy + Math.sin(t * 3.1 + 0.7) * ampY
    };
  }
}
