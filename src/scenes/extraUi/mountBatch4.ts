import Phaser from "phaser";
import type { MountCtx, CleanupFn } from "./mountTypes";
import { pushLayers, scheduleFinish, tweenFlash } from "./mountHelpers";
import { EscapeBoxMinigame } from "../../minigames/escapebox/EscapeBoxMinigame";
import { SurviveThreeMinigame } from "../../minigames/survivethree/SurviveThreeMinigame";

export function mountEscapeBox(ctx: MountCtx, game: EscapeBoxMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const pr = game.getPlayerRadius();
  const durationMs = game.getWinDurationSec() * 1000;
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const cx = width / 2;
  const cy = height * 0.52;
  let half = game.initialHalfSize(width, height);

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x050808, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.14, "SHRINK BOX", {
      fontSize: "38px",
      color: "#aed581",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(10);
  pushLayers(layers, title);

  const frame = scene.add
    .rectangle(cx, cy, half * 2, half * 2, 0x000000, 0.001)
    .setStrokeStyle(4, 0xffca28, 0.85)
    .setDepth(9);
  layers.push(frame);

  let px = cx;
  let py = cy;

  const player = scene.add
    .circle(px, py, pr, 0x69f0ae, 0.95)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(14);
  layers.push(player);

  const fill = scene.add
    .rectangle(width / 2 - 150, height * 0.09, 300, 6, 0xffeb3b, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(11);
  layers.push(fill);

  const keys = scene.input.keyboard?.addKeys("W,A,S,D,UP,LEFT,DOWN,RIGHT") as Record<
    string,
    Phaser.Input.Keyboard.Key
  >;

  const finishRound = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("escapeBox")) {
      return;
    }
    ended = true;
    if (ok) {
      tweenFlash(scene, 0xc5e1a5);
      scheduleFinish(ctx, 560, true, cleanup, "escapeBox");
    } else {
      scene.cameras.main.shake(220, 0.009);
      tweenFlash(scene, 0xc62828);
      scheduleFinish(ctx, 560, false, cleanup, "escapeBox");
    }
  };

  const tick = (_t: number, dt: number) => {
    if (destroyed || ended || !ctx.active("escapeBox")) {
      return;
    }

    const spd = 210 * (dt / 1000);
    if (keys) {
      if (keys.W?.isDown || keys.UP?.isDown) {
        py -= spd;
      }
      if (keys.S?.isDown || keys.DOWN?.isDown) {
        py += spd;
      }
      if (keys.A?.isDown || keys.LEFT?.isDown) {
        px -= spd;
      }
      if (keys.D?.isDown || keys.RIGHT?.isDown) {
        px += spd;
      }
    }

    half -= game.getShrinkPerSec() * (dt / 1000);
    half = Math.max(42, half);
    frame.setSize(half * 2, half * 2);

    const minX = cx - half + pr;
    const maxX = cx + half - pr;
    const minY = cy - half + pr;
    const maxY = cy + half - pr;

    if (px < minX || px > maxX || py < minY || py > maxY) {
      finishRound(false);
      return;
    }

    px = Phaser.Math.Clamp(px, minX, maxX);
    py = Phaser.Math.Clamp(py, minY, maxY);
    player.setPosition(px, py);

    const elapsed = scene.time.now - startAt;
    fill.scaleX = Phaser.Math.Clamp(1 - elapsed / durationMs, 0, 1);
    if (elapsed >= durationMs) {
      finishRound(true);
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

type Bullet = {
  c: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
};

export function mountSurviveThree(ctx: MountCtx, game: SurviveThreeMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  const bullets: Bullet[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const durMs = game.getDurationSec() * 1000;
  const startAt = scene.time.now;
  const br = game.getBulletRadius();
  const pr = game.getPlayerRadius();

  const { width, height } = scene.scale;
  const ax = 50;
  const ay = height * 0.18;
  const arenaW = width - 100;
  const arenaH = height * 0.62;

  let px = width / 2;
  let py = ay + arenaH / 2;

  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x080510, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const arena = scene.add
    .rectangle(ax + arenaW / 2, ay + arenaH / 2, arenaW, arenaH, 0x120818, 0.85)
    .setStrokeStyle(2, 0xab47bc, 0.45)
    .setDepth(8);
  pushLayers(layers, arena);

  const title = scene.add
    .text(width / 2, height * 0.1, "THREE SECOND MAYHEM", {
      fontSize: "30px",
      color: "#ea80fc",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 7
    })
    .setOrigin(0.5)
    .setDepth(10);
  pushLayers(layers, title);

  const player = scene.add
    .circle(px, py, pr, 0x40c4ff, 0.95)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(14);
  layers.push(player);

  const fill = scene.add
    .rectangle(width / 2 - 160, height * 0.065, 320, 7, 0xe040fb, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(11);
  layers.push(fill);

  const keys = scene.input.keyboard?.addKeys("W,A,S,D,UP,LEFT,DOWN,RIGHT") as Record<
    string,
    Phaser.Input.Keyboard.Key
  >;

  const spawnBullet = () => {
    if (destroyed || ended || !ctx.active("surviveThree")) {
      return;
    }
    const edge = Math.floor(Math.random() * 4);
    let bx = ax + arenaW / 2;
    let by = ay + arenaH / 2;
    let vx = 0;
    let vy = 0;
    const spd = game.getBulletSpeed();
    if (edge === 0) {
      bx = ax + Math.random() * arenaW;
      by = ay - 20;
      vx = Phaser.Math.FloatBetween(-spd * 0.35, spd * 0.35);
      vy = spd;
    } else if (edge === 1) {
      bx = ax + arenaW + 20;
      by = ay + Math.random() * arenaH;
      vx = -spd;
      vy = Phaser.Math.FloatBetween(-spd * 0.35, spd * 0.35);
    } else if (edge === 2) {
      bx = ax + Math.random() * arenaW;
      by = ay + arenaH + 20;
      vx = Phaser.Math.FloatBetween(-spd * 0.35, spd * 0.35);
      vy = -spd;
    } else {
      bx = ax - 20;
      by = ay + Math.random() * arenaH;
      vx = spd;
      vy = Phaser.Math.FloatBetween(-spd * 0.35, spd * 0.35);
    }

    const c = scene.add
      .circle(bx, by, br, 0xff1744, 0.92)
      .setStrokeStyle(2, 0xff8a80)
      .setDepth(12);
    bullets.push({ c, vx, vy });
  };

  const spawnEv = scene.time.addEvent({
    delay: game.getSpawnIntervalMs(),
    loop: true,
    callback: spawnBullet
  });
  scene.time.delayedCall(40, spawnBullet);

  const finishRound = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("surviveThree")) {
      return;
    }
    ended = true;
    spawnEv.remove(false);
    if (ok) {
      tweenFlash(scene, 0xea80fc);
      scheduleFinish(ctx, 560, true, cleanup, "surviveThree");
    } else {
      scene.cameras.main.shake(220, 0.009);
      tweenFlash(scene, 0xb71c1c);
      scheduleFinish(ctx, 560, false, cleanup, "surviveThree");
    }
  };

  const tick = (_t: number, dt: number) => {
    if (destroyed || ended || !ctx.active("surviveThree")) {
      return;
    }

    const spd = game.getPlayerSpeed() * (dt / 1000);
    if (keys) {
      if (keys.W?.isDown || keys.UP?.isDown) {
        py -= spd;
      }
      if (keys.S?.isDown || keys.DOWN?.isDown) {
        py += spd;
      }
      if (keys.A?.isDown || keys.LEFT?.isDown) {
        px -= spd;
      }
      if (keys.D?.isDown || keys.RIGHT?.isDown) {
        px += spd;
      }
    }
    px = Phaser.Math.Clamp(px, ax + pr + 4, ax + arenaW - pr - 4);
    py = Phaser.Math.Clamp(py, ay + pr + 4, ay + arenaH - pr - 4);
    player.setPosition(px, py);

    const elapsed = scene.time.now - startAt;
    fill.scaleX = Phaser.Math.Clamp(1 - elapsed / durMs, 0, 1);
    if (elapsed >= durMs) {
      finishRound(true);
      return;
    }

    const dtSec = dt / 1000;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.c.x += b.vx * dtSec;
      b.c.y += b.vy * dtSec;

      const bx = b.c.x;
      const by = b.c.y;
      if (Phaser.Math.Distance.Between(px, py, bx, by) < pr + br) {
        finishRound(false);
        return;
      }

      if (bx < ax - 60 || bx > ax + arenaW + 60 || by < ay - 60 || by > ay + arenaH + 60) {
        b.c.destroy();
        bullets.splice(i, 1);
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
    bullets.forEach((b) => b.c.destroy());
    bullets.length = 0;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}
