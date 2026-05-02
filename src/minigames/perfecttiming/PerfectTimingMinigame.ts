/**
 * Oscillating needle must be stopped inside the green zone (logic-only).
 */
export class PerfectTimingMinigame {
  private level = 1;
  private zoneHalfWidth = 0.11;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
    this.zoneHalfWidth = Math.max(
      0.034,
      0.118 - (this.level - 1) * 0.0092
    );
  }

  getZoneStart(): number {
    return 0.5 - this.zoneHalfWidth;
  }

  getZoneEnd(): number {
    return 0.5 + this.zoneHalfWidth;
  }

  /** Needle position along the bar in [0, 1] at game time (ms). */
  getNeedleT(timeMs: number): number {
    const omega = Math.min(4.05, 1.12 + (this.level - 1) * 0.29);
    const t = timeMs * 0.001;
    return (Math.sin(t * omega) + 1) / 2;
  }

  isInZone(needleT: number): boolean {
    return needleT >= this.getZoneStart() && needleT <= this.getZoneEnd();
  }
}
