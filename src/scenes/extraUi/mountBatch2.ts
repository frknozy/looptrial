import Phaser from "phaser";
import type { MountCtx, CleanupFn } from "./mountTypes";
import { pushLayers, scheduleFinish, tweenFlash } from "./mountHelpers";
import {
  ColorRecallMinigame,
  type RecallColor
} from "../../minigames/colorrecall/ColorRecallMinigame";
import { PatternRepeatMinigame } from "../../minigames/patternrepeat/PatternRepeatMinigame";
import { SmallTargetMinigame } from "../../minigames/smalltarget/SmallTargetMinigame";
import { MovingDotMinigame } from "../../minigames/movingdot/MovingDotMinigame";

const ARROWS = ["↑", "→", "↓", "←"];

export function mountColorRecall(ctx: MountCtx, game: ColorRecallMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.resetRound();
  const target = game.palette[game.targetIndex];
  const choices = game.getChoices();

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x050816, 0.98)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.18, "COLOR RECALL", {
      fontSize: "38px",
      color: "#ffab91",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const splash = scene.add
    .text(width / 2, height * 0.42, target.label, {
      fontSize: "72px",
      color: "#ffffff",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 10
    })
    .setOrigin(0.5)
    .setDepth(12);
  splash.setColor(`#${target.hex.toString(16).padStart(6, "0")}`);

  const flashBg = scene.add
    .rectangle(width / 2, height / 2, width, height, target.hex, 0.35)
    .setDepth(11);
  pushLayers(layers, flashBg, splash);

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("colorRecall")) {
      return;
    }
    ended = true;
    choiceRects.forEach((r) => r.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0xffab40);
    } else {
      scene.cameras.main.shake(170, 0.007);
      tweenFlash(scene, 0xc62828);
    }
    scheduleFinish(ctx, 560, ok, cleanup, "colorRecall");
  };

  const choiceRects: Phaser.GameObjects.Rectangle[] = [];
  scene.tweens.add({
    targets: [splash, flashBg],
    alpha: 0,
    duration: 720,
    delay: 900,
    ease: "Cubic.easeIn",
    onComplete: () => {
      splash.destroy();
      flashBg.destroy();
      const cx = width / 2;
      const y = height * 0.58;
      const bw = 108;
      const gap = 22;
      const total = choices.length * bw + (choices.length - 1) * gap;
      let x0 = cx - total / 2 + bw / 2;
      choices.forEach((c: RecallColor, i) => {
        const rect = scene.add
          .rectangle(x0 + i * (bw + gap), y, bw, bw, c.hex, 0.95)
          .setStrokeStyle(3, 0xffffff, 0.35)
          .setInteractive({ useHandCursor: true })
          .setDepth(10);
        rect.on("pointerup", () => finish(c.id === target.id));
        choiceRects.push(rect);
        layers.push(rect);
      });
    }
  });

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountPatternRepeat(ctx: MountCtx, game: PatternRepeatMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;
  let inputOn = false;
  let step = 0;

  game.configure(ctx.getLevel());
  const pattern = game.buildPattern();

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x0a1530, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.18, "ARROW CODE", {
      fontSize: "40px",
      color: "#82b1ff",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);

  const demo = scene.add
    .text(width / 2, height * 0.34, "", {
      fontSize: "52px",
      color: "#ffffff",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setAlpha(0)
    .setDepth(12);
  pushLayers(layers, title, demo);

  const cx = width / 2;
  const cy = height * 0.62;
  const btnR = 56;
  const dist = 118;
  const btnPos = [
    { x: cx, y: cy - dist },
    { x: cx + dist, y: cy },
    { x: cx, y: cy + dist },
    { x: cx - dist, y: cy }
  ];

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("patternRepeat")) {
      return;
    }
    ended = true;
    btns.forEach((b) => b.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0x448aff);
    } else {
      scene.cameras.main.shake(180, 0.007);
      tweenFlash(scene, 0xc62828);
    }
    scheduleFinish(ctx, 560, ok, cleanup, "patternRepeat");
  };

  const btns: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < 4; i++) {
    const b = scene.add
      .circle(btnPos[i].x, btnPos[i].y, btnR, 0x1a237e, 0.85)
      .setStrokeStyle(3, 0x7986cb, 0.75)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    const lbl = scene.add
      .text(btnPos[i].x, btnPos[i].y, ARROWS[i], {
        fontSize: "36px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5)
      .setDepth(11);
    layers.push(lbl);
    const idx = i;
    b.on("pointerup", () => {
      if (!inputOn || ended || destroyed) {
        return;
      }
      if (pattern[step] !== idx) {
        finish(false);
        return;
      }
      step++;
      if (step >= pattern.length) {
        finish(true);
      }
    });
    btns.push(b);
    layers.push(b);
  }

  let pi = 0;
  const showPatternStep = () => {
    if (destroyed || ended || !ctx.active("patternRepeat")) {
      return;
    }
    if (pi >= pattern.length) {
      demo.setText("");
      inputOn = true;
      demo.setAlpha(0);
      return;
    }
    demo.setAlpha(1);
    demo.setText(ARROWS[pattern[pi]]);
    scene.tweens.add({
      targets: demo,
      alpha: { from: 1, to: 0 },
      duration: 420,
      delay: 80,
      onComplete: () => {
        pi++;
        scene.time.delayedCall(120, showPatternStep);
      }
    });
  };

  scene.time.delayedCall(500, showPatternStep);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    demo.destroy();
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountSmallTarget(ctx: MountCtx, game: SmallTargetMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const r = game.getRadius();
  const limit = game.getTimeLimitMs();
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const margin = 90;
  const pos = game.randomPos(margin, width, height);

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x050505, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.16, "PINPOINT", {
      fontSize: "40px",
      color: "#eceff1",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const barW = 320;
  const fill = scene.add
    .rectangle(width / 2 - barW / 2, height * 0.1, barW, 6, 0xb0bec5, 0.9)
    .setOrigin(0, 0.5)
    .setDepth(9);
  layers.push(fill);

  const dot = scene.add
    .circle(pos.x, pos.y, r, 0xff4081, 0.95)
    .setStrokeStyle(2, 0xffffff, 0.85)
    .setInteractive({
      hitArea: new Phaser.Geom.Circle(0, 0, r + 14),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      useHandCursor: true
    })
    .setDepth(14);

  dot.on("pointerup", () => {
    if (ended || destroyed || !ctx.active("smallTarget")) {
      return;
    }
    ended = true;
    tweenFlash(scene, 0xff4081);
    scheduleFinish(ctx, 520, true, cleanup, "smallTarget");
  });

  layers.push(dot);

  const tick = () => {
    if (destroyed || ended || !ctx.active("smallTarget")) {
      return;
    }
    const elapsed = scene.time.now - startAt;
    const rem = Phaser.Math.Clamp(1 - elapsed / limit, 0, 1);
    fill.scaleX = rem;
    if (elapsed >= limit) {
      ended = true;
      scene.cameras.main.shake(160, 0.006);
      tweenFlash(scene, 0xd50000);
      scheduleFinish(ctx, 520, false, cleanup, "smallTarget");
    }
  };

  scene.events.on("update", tick);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    scene.events.off("update", tick);
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountMovingDot(ctx: MountCtx, game: MovingDotMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const r = game.getRadius();
  const limit = game.getTimeLimitMs();
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const cx = width / 2;
  const cy = height * 0.5;
  const ampX = Math.min(width * 0.38, cx - 80 - r);
  const ampY = Math.min(height * 0.28, cy - 100);

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x120810, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.14, "DOT CHASE", {
      fontSize: "40px",
      color: "#f48fb1",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const fill = scene.add
    .rectangle(width / 2 - 160, height * 0.09, 320, 6, 0xf06292, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(9);
  layers.push(fill);

  const dot = scene.add
    .circle(cx, cy, r, 0xff4081, 0.95)
    .setStrokeStyle(3, 0xffffff, 0.9)
    .setDepth(14);

  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.0001)
    .setInteractive({ useHandCursor: true })
    .setDepth(15);

  const tryHit = (px: number, py: number) => {
    if (ended || destroyed || !ctx.active("movingDot")) {
      return;
    }
    const dx = px - dot.x;
    const dy = py - dot.y;
    if (dx * dx + dy * dy <= (r + 22) * (r + 22)) {
      ended = true;
      tweenFlash(scene, 0xf48fb1);
      scheduleFinish(ctx, 540, true, cleanup, "movingDot");
    }
  };

  overlay.on("pointerdown", (p: Phaser.Input.Pointer) => {
    tryHit(p.worldX, p.worldY);
  });

  layers.push(dot, overlay);

  const tick = () => {
    if (destroyed || ended || !ctx.active("movingDot")) {
      return;
    }
    const p = game.pos(scene.time.now, cx, cy, ampX, ampY);
    dot.setPosition(p.x, p.y);

    const elapsed = scene.time.now - startAt;
    fill.scaleX = Phaser.Math.Clamp(1 - elapsed / limit, 0, 1);
    if (elapsed >= limit) {
      ended = true;
      scene.cameras.main.shake(180, 0.007);
      tweenFlash(scene, 0xc62828);
      scheduleFinish(ctx, 540, false, cleanup, "movingDot");
    }
  };

  scene.events.on("update", tick);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    scene.events.off("update", tick);
    overlay.removeInteractive();
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}
