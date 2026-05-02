import Phaser from "phaser";
import type { MountCtx } from "./mountTypes";

export function pushLayers(
  layers: Phaser.GameObjects.GameObject[],
  ...objs: Phaser.GameObjects.GameObject[]
): void {
  layers.push(...objs);
}

export function scheduleFinish(
  ctx: MountCtx,
  delayMs: number,
  success: boolean,
  cleanup: () => void,
  guardId: import("../../core/managers/MinigameManager").MinigameId
): void {
  ctx.scene.time.delayedCall(delayMs, () => {
    if (!ctx.active(guardId)) {
      return;
    }
    cleanup();
    if (success) {
      ctx.win();
    } else {
      ctx.lose();
    }
  });
}

export function tweenFlash(
  scene: Phaser.Scene,
  color: number,
  duration = 260
): Phaser.GameObjects.Rectangle {
  const { width, height } = scene.scale;
  const r = scene.add
    .rectangle(width / 2, height / 2, width, height, color, 0.12)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setDepth(24);
  scene.tweens.add({
    targets: r,
    alpha: 0,
    duration,
    ease: "Cubic.easeOut",
    onComplete: () => r.destroy()
  });
  return r;
}
