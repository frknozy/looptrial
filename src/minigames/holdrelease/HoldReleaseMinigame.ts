export type HoldReleaseOutcome = "early" | "perfect" | "late";

/**
 * Charge 0→1 while holding; release inside [zoneStart, zoneEnd] on the meter.
 */
export class HoldReleaseMinigame {
  private level = 1;
  private zoneStart = 0.35;
  private zoneEnd = 0.55;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
    this.rollZone();
  }

  /** Charge units per second (meter fills faster at higher level). */
  getFillRate(): number {
    return Math.min(3.4, 1.05 + (this.level - 1) * 0.22);
  }

  rollZone(): void {
    const zoneWidth = Math.max(0.07, 0.2 - (this.level - 1) * 0.014);
    const maxStart = 1 - zoneWidth;
    this.zoneStart = Math.random() * maxStart;
    this.zoneEnd = this.zoneStart + zoneWidth;
  }

  getZoneStart(): number {
    return this.zoneStart;
  }

  getZoneEnd(): number {
    return this.zoneEnd;
  }

  evaluateRelease(charge: number): HoldReleaseOutcome {
    const c = Math.min(1, Math.max(0, charge));
    if (c < this.zoneStart) {
      return "early";
    }
    if (c > this.zoneEnd) {
      return "late";
    }
    return "perfect";
  }
}
