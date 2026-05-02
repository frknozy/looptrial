import Phaser from "phaser";
import type { MountCtx, CleanupFn } from "./mountTypes";
import { pushLayers, scheduleFinish, tweenFlash } from "./mountHelpers";
import { AimDirectionMinigame } from "../../minigames/aimdirection/AimDirectionMinigame";
import { ShrinkingCircleMinigame } from "../../minigames/shrinkingcircle/ShrinkingCircleMinigame";
import { LaneSwitchMinigame } from "../../minigames/laneswitch/LaneSwitchMinigame";
import { AvoidRedMinigame } from "../../minigames/avoidred/AvoidRedMinigame";

export function mountAimDirection(ctx: MountCtx, game: AimDirectionMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.resetRound();
  const label = game.getLabel();

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x051025, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.2, "CARDINAL AIM", {
      fontSize: "36px",
      color: "#90caf9",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);

  const prompt = scene.add
    .text(width / 2, height * 0.3, `Tap: ${label}`, {
      fontSize: "48px",
      color: "#ffe082",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 10
    })
    .setOrigin(0.5)
    .setDepth(10);
  pushLayers(layers, title, prompt);

  const cx = width / 2;
  const cy = height * 0.54;
  const d = 112;
  const zones = [
    { x: cx, y: cy - d, i: 0 },
    { x: cx + d, y: cy, i: 1 },
    { x: cx, y: cy + d, i: 2 },
    { x: cx - d, y: cy, i: 3 }
  ];

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("aimDirection")) {
      return;
    }
    ended = true;
    rects.forEach((r) => r.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0x42a5f5);
    } else {
      scene.cameras.main.shake(170, 0.007);
      tweenFlash(scene, 0xb71c1c);
    }
    scheduleFinish(ctx, 540, ok, cleanup, "aimDirection");
  };

  const rects: Phaser.GameObjects.Rectangle[] = [];
  zones.forEach((z) => {
    const rect = scene.add
      .rectangle(z.x, z.y, 92, 76, 0x1565c0, 0.65)
      .setStrokeStyle(2, 0xbbdefb, 0.55)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    const lbl = scene.add
      .text(z.x, z.y, game.labels[z.i], {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5)
      .setDepth(11);
    rect.on("pointerup", () => finish(z.i === game.targetIndex));
    rects.push(rect);
    layers.push(rect, lbl);
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

export function mountShrinkingCircle(ctx: MountCtx, game: ShrinkingCircleMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const barW = 420;
  const { width, height } = scene.scale;
  const cx = width / 2;
  const barY = height * 0.48;

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x080810, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.2, "PULSE LOCK", {
      fontSize: "40px",
      color: "#b388ff",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);

  const hint = scene.add
    .text(width / 2, height * 0.3, "SPACE when the wave sits in the violet band", {
      fontSize: "14px",
      color: "#d1c4e9",
      fontFamily: "Segoe UI, Roboto, Arial"
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title, hint);

  const { start, end } = game.getSweetSpot();
  const zx = cx - barW / 2 + ((start + end) / 2) * barW;
  const zw = (end - start) * barW;

  const zGlow = scene.add
    .rectangle(zx, barY, zw + 12, 26, 0x7c4dff, 0.22)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setDepth(9);
  const zBand = scene.add
    .rectangle(zx, barY, zw, 18, 0xb388ff, 0.35)
    .setDepth(10);
  pushLayers(layers, zGlow, zBand);

  const track = scene.add
    .rectangle(cx, barY, barW, 18, 0x1a1025, 0.92)
    .setStrokeStyle(2, 0x9575cd, 0.5)
    .setDepth(8);

  const needle = scene.add
    .rectangle(cx - barW / 2, barY, 8, 36, 0xffffff, 0.95)
    .setOrigin(0.5, 0.5)
    .setDepth(12);
  pushLayers(layers, track, needle);

  const spaceFn = () => {
    if (ended || destroyed || !ctx.active("shrinkingCircle")) {
      return;
    }
    const t = game.getPulseT(scene.time.now);
    const ok = game.isHit(t);
    ended = true;
    scene.input.keyboard?.off("keydown-SPACE", spaceFn);
    if (ok) {
      tweenFlash(scene, 0xea80fc);
      scheduleFinish(ctx, 540, true, cleanup, "shrinkingCircle");
    } else {
      scene.cameras.main.shake(200, 0.008);
      tweenFlash(scene, 0xc62828);
      scheduleFinish(ctx, 540, false, cleanup, "shrinkingCircle");
    }
  };

  scene.input.keyboard?.on("keydown-SPACE", spaceFn);

  const tick = () => {
    if (destroyed || ended || !ctx.active("shrinkingCircle")) {
      return;
    }
    const t = game.getPulseT(scene.time.now);
    needle.x = cx - barW / 2 + t * barW;
  };

  scene.events.on("update", tick);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    scene.events.off("update", tick);
    scene.input.keyboard?.off("keydown-SPACE", spaceFn);
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountLaneSwitch(ctx: MountCtx, game: LaneSwitchMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  const hazards: Phaser.GameObjects.Rectangle[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const durMs = game.getRoundDurationSec() * 1000;
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const arenaW = Math.min(420, width - 60);
  const arenaH = height * 0.52;
  const ax = width / 2 - arenaW / 2;
  const ay = height * 0.28;
  const laneW = arenaW / game.lanes;

  let lane = 1;
  const playerY = ay + arenaH - 36;

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x120508, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const arena = scene.add
    .rectangle(width / 2, ay + arenaH / 2, arenaW + 16, arenaH + 16, 0xff1744, 0.08)
    .setStrokeStyle(3, 0xff5252, 0.55)
    .setDepth(7);
  const inner = scene.add
    .rectangle(width / 2, ay + arenaH / 2, arenaW, arenaH, 0x1a0508, 0.88)
    .setStrokeStyle(2, 0x880e4f, 0.4)
    .setDepth(8);
  pushLayers(layers, arena, inner);

  const title = scene.add
    .text(width / 2, height * 0.14, "LANE SWITCH", {
      fontSize: "36px",
      color: "#ff8a80",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(10);
  pushLayers(layers, title);

  const player = scene.add
    .circle(ax + lane * laneW + laneW / 2, playerY, 14, 0x69f0ae, 0.95)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(14);
  layers.push(player);

  const fill = scene.add
    .rectangle(width / 2 - 160, height * 0.09, 320, 8, 0xff5252, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(9);
  layers.push(fill);

  const keys = scene.input.keyboard?.addKeys("LEFT,RIGHT,A,D") as {
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  const shiftLane = (d: number) => {
    lane = Phaser.Math.Clamp(lane + d, 0, game.lanes - 1);
    player.x = ax + lane * laneW + laneW / 2;
  };

  const spawn = () => {
    if (destroyed || ended || !ctx.active("laneSwitch")) {
      return;
    }
    const hl = game.randomLane();
    const hx = ax + hl * laneW + laneW / 2;
    const h = scene.add
      .rectangle(hx, ay + 16, laneW - 18, 26, 0xd50000, 0.92)
      .setStrokeStyle(2, 0xff8a80)
      .setDepth(12);
    h.setData("vy", game.getFallSpeed());
    hazards.push(h);
  };

  const spawnEv = scene.time.addEvent({
    delay: game.getSpawnIntervalMs(),
    loop: true,
    callback: spawn
  });
  scene.time.delayedCall(80, spawn);

  const finishRound = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("laneSwitch")) {
      return;
    }
    ended = true;
    spawnEv.remove(false);
    if (ok) {
      tweenFlash(scene, 0x69f0ae);
      scheduleFinish(ctx, 580, true, cleanup, "laneSwitch");
    } else {
      scene.cameras.main.shake(220, 0.009);
      tweenFlash(scene, 0xc62828);
      scheduleFinish(ctx, 580, false, cleanup, "laneSwitch");
    }
  };

  const tick = (_t: number, dt: number) => {
    if (destroyed || ended || !ctx.active("laneSwitch")) {
      return;
    }
    if (keys) {
      if (Phaser.Input.Keyboard.JustDown(keys.LEFT) || Phaser.Input.Keyboard.JustDown(keys.A)) {
        shiftLane(-1);
      }
      if (Phaser.Input.Keyboard.JustDown(keys.RIGHT) || Phaser.Input.Keyboard.JustDown(keys.D)) {
        shiftLane(1);
      }
    }

    const elapsed = scene.time.now - startAt;
    fill.scaleX = Phaser.Math.Clamp(1 - elapsed / durMs, 0, 1);
    if (elapsed >= durMs) {
      finishRound(true);
      return;
    }

    const dtSec = dt / 1000;
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      const vy = h.getData("vy") as number;
      h.y += vy * dtSec;
      if (h.y > playerY - 10 && Math.abs(h.x - player.x) < laneW * 0.42) {
        finishRound(false);
        return;
      }
      if (h.y > ay + arenaH + 40) {
        h.destroy();
        hazards.splice(i, 1);
      }
    }
  };

  scene.events.on("update", tick);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    spawnEv.remove(false);
    scene.events.off("update", tick);
    hazards.forEach((h) => h.destroy());
    hazards.length = 0;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountAvoidRed(ctx: MountCtx, game: AvoidRedMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  const bars: Phaser.GameObjects.Rectangle[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const durMs = game.getRoundDurationSec() * 1000;
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const arenaW = width - 80;
  const arenaH = height * 0.55;
  const ax = 40;
  const ay = height * 0.22;

  let py = ay + arenaH / 2;

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x050510, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const arena = scene.add
    .rectangle(ax + arenaW / 2, ay + arenaH / 2, arenaW, arenaH, 0x0a0e18, 0.88)
    .setStrokeStyle(2, 0x3949ab, 0.45)
    .setDepth(8);
  pushLayers(layers, arena);

  const title = scene.add
    .text(width / 2, height * 0.12, "RED SWEEP", {
      fontSize: "36px",
      color: "#ff5252",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(10);
  pushLayers(layers, title);

  const player = scene.add
    .circle(ax + arenaW / 2, py, 13, 0x29b6f6, 0.95)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(14);
  layers.push(player);

  const fill = scene.add
    .rectangle(width / 2 - 160, height * 0.075, 320, 6, 0x448aff, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(9);
  layers.push(fill);

  const keys = scene.input.keyboard?.addKeys("UP,DOWN,W,S") as {
    UP: Phaser.Input.Keyboard.Key;
    DOWN: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
  };

  const spawnBar = () => {
    if (destroyed || ended || !ctx.active("avoidRed")) {
      return;
    }
    const fromLeft = Math.random() < 0.5;
    const y = ay + 40 + Math.random() * (arenaH - 80);
    const bw = 120 + Math.random() * 90;
    const x = fromLeft ? ax - bw : ax + arenaW + bw;
    const bar = scene.add
      .rectangle(x, y, bw, 22, 0xff1744, 0.9)
      .setStrokeStyle(2, 0xff8a80)
      .setDepth(11);
    bar.setData("vx", fromLeft ? game.getHazardSpeed() : -game.getHazardSpeed());
    bars.push(bar);
  };

  const spawnEv = scene.time.addEvent({
    delay: game.getSpawnIntervalMs(),
    loop: true,
    callback: spawnBar
  });
  scene.time.delayedCall(60, spawnBar);

  const finishRound = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("avoidRed")) {
      return;
    }
    ended = true;
    spawnEv.remove(false);
    if (ok) {
      tweenFlash(scene, 0x448aff);
      scheduleFinish(ctx, 560, true, cleanup, "avoidRed");
    } else {
      scene.cameras.main.shake(200, 0.008);
      tweenFlash(scene, 0xb71c1c);
      scheduleFinish(ctx, 560, false, cleanup, "avoidRed");
    }
  };

  const tick = (_t: number, dt: number) => {
    if (destroyed || ended || !ctx.active("avoidRed")) {
      return;
    }
    const spd = game.getPlayerSpeed() * (dt / 1000);
    if (keys) {
      if (keys.UP.isDown || keys.W.isDown) {
        py -= spd;
      }
      if (keys.DOWN.isDown || keys.S.isDown) {
        py += spd;
      }
    }
    py = Phaser.Math.Clamp(py, ay + 24, ay + arenaH - 24);
    player.y = py;

    const elapsed = scene.time.now - startAt;
    fill.scaleX = Phaser.Math.Clamp(1 - elapsed / durMs, 0, 1);
    if (elapsed >= durMs) {
      finishRound(true);
      return;
    }

    const dtSec = dt / 1000;
    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i];
      const vx = b.getData("vx") as number;
      b.x += vx * dtSec;
      const ob = b.getBounds();
      const pb = player.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(ob, pb)) {
        finishRound(false);
        return;
      }
      if (b.x < ax - 200 || b.x > ax + arenaW + 200) {
        b.destroy();
        bars.splice(i, 1);
      }
    }
  };

  scene.events.on("update", tick);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    spawnEv.remove(false);
    scene.events.off("update", tick);
    bars.forEach((b) => b.destroy());
    bars.length = 0;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}
