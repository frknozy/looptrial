/**
 * Tuning for moving-target click challenge (logic-only).
 */
export class MovingTargetMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  /** Time to land a hit (ms). */
  getTimeLimitMs(): number {
    return Math.max(2400, 5600 - (this.level - 1) * 300);
  }

  /** Hit radius (px). */
  getTargetRadius(): number {
    return Math.max(17, 36 - (this.level - 1) * 1.8);
  }

  /** Multiplier on motion angular frequency (higher = faster drift). */
  getMotionSpeed(): number {
    return Math.min(2.85, 1.05 + (this.level - 1) * 0.18);
  }
}
