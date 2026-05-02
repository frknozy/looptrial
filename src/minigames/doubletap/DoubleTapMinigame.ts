/**
 * Double-tap timing challenge: second input must land within `windowMs` of the first.
 */
export class DoubleTapMinigame {
  private level = 1;
  private windowMs = 420;
  private armed = false;
  private firstAtMs = 0;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
    this.windowMs = Math.max(200, 520 - (this.level - 1) * 34);
    this.disarm();
  }

  getWindowMs(): number {
    return this.windowMs;
  }

  disarm(): void {
    this.armed = false;
    this.firstAtMs = 0;
  }

  registerFirstTap(nowMs: number): void {
    this.armed = true;
    this.firstAtMs = nowMs;
  }

  isWaitingSecondTap(): boolean {
    return this.armed;
  }

  /** Second tap in the same round. */
  evaluateSecondTap(nowMs: number): "success" | "late" {
    if (!this.armed) {
      return "late";
    }

    const dt = nowMs - this.firstAtMs;
    this.armed = false;

    if (dt <= this.windowMs) {
      return "success";
    }

    return "late";
  }
}
