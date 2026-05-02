import type { MinigameId } from "../../core/managers/MinigameManager";

/** Shared bridge for mounted minigames (no import from GameScene — avoids cycles). */
export type MountCtx = {
  scene: Phaser.Scene;
  getLevel: () => number;
  win: () => void;
  lose: () => void;
  /** Guard delayed callbacks after scene swap / minigame change */
  active: (id: MinigameId) => boolean;
};

export type CleanupFn = () => void;
