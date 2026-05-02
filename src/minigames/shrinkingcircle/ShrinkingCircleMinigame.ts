/** Pulse 0–1 — stop (SPACE) inside the sweet spot window. */
export class ShrinkingCircleMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  /** Seconds per full pulse cycle. */
  getPeriodSec(): number {
    return Math.max(0.85, 1.65 - (this.level - 1) * 0.07);
  }

  /** Normalized window [start,end] on the triangle wave peak. */
  getSweetSpot(): { start: number; end: number } {
    const half = Math.max(0.06, 0.13 - (this.level - 1) * 0.008);
    return { start: 0.5 - half, end: 0.5 + half };
  }

  /** 0–1 saw/triangle position over time. */
  getPulseT(timeMs: number): number {
    const p = this.getPeriodSec();
    const u = ((timeMs * 0.001) % p) / p;
    const tri = u < 0.5 ? u * 2 : 2 - u * 2;
    return tri;
  }

  isHit(pulseT: number): boolean {
    const { start, end } = this.getSweetSpot();
    return pulseT >= start && pulseT <= end;
  }
}
