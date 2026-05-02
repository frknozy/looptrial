/**
 * Difficulty & tuning for the dodge survival minigame (logic-only).
 * Visuals and collision run in GameScene.
 */
export class DodgeMinigame {
  private level = 1;

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  /** Total time player must survive (seconds). */
  getRoundDurationSec(): number {
    const base = 5.2;
    const decay = (this.level - 1) * 0.28;
    return Math.max(2.6, base - decay);
  }

  /** How often a new obstacle spawns (ms). */
  getSpawnIntervalMs(): number {
    const base = 820;
    const decay = (this.level - 1) * 42;
    return Math.max(340, base - decay);
  }

  /** Vertical speed of obstacles (pixels per second). */
  getObstacleFallSpeed(): number {
    const base = 210;
    const boost = (this.level - 1) * 18;
    return Math.min(420, base + boost);
  }

  /** Horizontal move speed for the player (pixels per second). */
  getPlayerMoveSpeed(): number {
    const base = 300;
    const boost = (this.level - 1) * 12;
    return Math.min(460, base + boost);
  }

  getArenaPadding(): number {
    return 48;
  }

  getPlayerRadius(): number {
    return 16;
  }

  randomObstacleWidth(): number {
    const min = 46;
    const max = 72;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getObstacleHeight(): number {
    return 22;
  }
}
