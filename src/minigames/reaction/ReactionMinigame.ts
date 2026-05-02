export type ReactionAttemptResult = "success" | "too_early" | "too_late";

export class ReactionMinigame {
  private phase: ReactionPhase = "idle";
  private waitDelayMs = 0;
  private nowShownAtMs = 0;
  private windowMs = 700;

  configure(level: number): void {
    const clampedLevel = Math.max(1, level);
    this.windowMs = Math.max(220, 700 - (clampedLevel - 1) * 35);
    this.phase = "idle";
    this.waitDelayMs = 0;
    this.nowShownAtMs = 0;
  }

  getWindowMs(): number {
    return this.windowMs;
  }

  getPhase(): ReactionPhase {
    return this.phase;
  }

  startRound(nowMs: number): { waitDelayMs: number } {
    this.phase = "wait";
    this.nowShownAtMs = 0;
    this.waitDelayMs = this.randomInt(650, 1400);
    return { waitDelayMs: this.waitDelayMs };
  }

  markNowShown(nowMs: number): void {
    if (this.phase !== "wait") {
      return;
    }
    this.phase = "now";
    this.nowShownAtMs = nowMs;
  }

  attempt(nowMs: number): ReactionAttemptResult {
    if (this.phase === "ended") {
      return "too_late";
    }

    if (this.phase === "wait") {
      return "too_early";
    }

    if (this.phase !== "now") {
      return "too_late";
    }

    const delta = nowMs - this.nowShownAtMs;
    if (delta < 0) {
      return "too_early";
    }

    if (delta > this.windowMs) {
      this.phase = "ended";
      return "too_late";
    }

    this.phase = "ended";
    return "success";
  }

  endIfLate(nowMs: number): ReactionAttemptResult | null {
    if (this.phase !== "now") {
      return null;
    }

    const delta = nowMs - this.nowShownAtMs;
    if (delta <= this.windowMs) {
      return null;
    }

    this.phase = "ended";
    return "too_late";
  }

  reset(): void {
    this.phase = "idle";
    this.waitDelayMs = 0;
    this.nowShownAtMs = 0;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
