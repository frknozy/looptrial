import Phaser from "phaser";
import type { MountCtx, CleanupFn } from "./mountTypes";
import { pushLayers, scheduleFinish, tweenFlash } from "./mountHelpers";
import { PickMinigame } from "../../minigames/pick/PickMinigame";
import { MemorySequenceMinigame } from "../../minigames/memorysequence/MemorySequenceMinigame";
import { FindDifferentMinigame } from "../../minigames/finddifferent/FindDifferentMinigame";
import { MatchPairMinigame } from "../../minigames/matchpair/MatchPairMinigame";

export function mountPick(ctx: MountCtx, game: PickMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.configure(ctx.getLevel());
  const answer = game.pickWinnerIndex();
  const limit = game.getTimeLimitMs();
  const startAt = scene.time.now;

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x0a0618, 0.96)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.28, "QUICK PICK", {
      fontSize: "42px",
      color: "#ffd54f",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);

  const hint = scene.add
    .text(width / 2, height * 0.36, "Tap the glowing lane before time runs out", {
      fontSize: "14px",
      color: "#ffe082",
      fontFamily: "Segoe UI, Roboto, Arial"
    })
    .setOrigin(0.5)
    .setDepth(8);

  pushLayers(layers, title, hint);

  const barW = Math.min(400, width - 80);
  const barY = height * 0.14;
  const cx = width / 2;
  const fill = scene.add
    .rectangle(cx - barW / 2, barY, barW, 8, 0xffea00, 0.85)
    .setOrigin(0, 0.5)
    .setDepth(9);
  const bgBar = scene.add
    .rectangle(cx, barY, barW + 8, 12, 0x1a1030, 0.9)
    .setStrokeStyle(2, 0xffab40, 0.5)
    .setDepth(8);
  pushLayers(layers, bgBar, fill);

  const laneW = 96;
  const baseY = height * 0.62;
  const gap = 18;
  const totalW = game.laneCount * laneW + (game.laneCount - 1) * gap;
  const left = cx - totalW / 2;

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("pick")) {
      return;
    }
    ended = true;
    laneRects.forEach((r) => r.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0x76ff03);
    } else {
      scene.cameras.main.shake(180, 0.007);
      tweenFlash(scene, 0xd50000);
    }
    scheduleFinish(ctx, 560, ok, cleanup, "pick");
  };

  const laneRects: Phaser.GameObjects.Rectangle[] = [];
  for (let i = 0; i < game.laneCount; i++) {
    const lx = left + i * (laneW + gap) + laneW / 2;
    const isWin = i === answer;
    const rect = scene.add
      .rectangle(lx, baseY, laneW, 120, isWin ? 0x1de9b6 : 0x263238, 0.85)
      .setStrokeStyle(3, isWin ? 0x69f0ae : 0x546e7a, isWin ? 0.9 : 0.6)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    rect.on("pointerup", () => {
      if (ended || destroyed) {
        return;
      }
      finish(i === answer);
    });
    laneRects.push(rect);
    layers.push(rect);
  }

  const tick = () => {
    if (destroyed || ended || !ctx.active("pick")) {
      return;
    }
    const elapsed = scene.time.now - startAt;
    const rem = Phaser.Math.Clamp(1 - elapsed / limit, 0, 1);
    fill.scaleX = rem;
    if (elapsed >= limit) {
      finish(false);
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

export function mountMemory(ctx: MountCtx, game: MemorySequenceMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;
  let inputPhase = false;
  let step = 0;

  game.configure(ctx.getLevel());
  const seq = game.buildSequence();

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x050816, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.2, "MEMORY PULSE", {
      fontSize: "38px",
      color: "#80deea",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const hint = scene.add
    .text(width / 2, height * 0.28, "Watch — then repeat the pattern", {
      fontSize: "14px",
      color: "#b2ebf2",
      fontFamily: "Segoe UI, Roboto, Arial"
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, hint);

  const cx = width / 2;
  const cy = height * 0.52;
  const padR = 52;
  const padGap = 140;
  const positions = [
    { x: cx - padGap, y: cy - padGap },
    { x: cx + padGap, y: cy - padGap },
    { x: cx - padGap, y: cy + padGap },
    { x: cx + padGap, y: cy + padGap }
  ];

  const pads: Phaser.GameObjects.Arc[] = [];
  const colors = [0xff5252, 0x69f0ae, 0x448aff, 0xffea00];

  const flashPad = (idx: number, onDone: () => void) => {
    const p = pads[idx];
    scene.tweens.add({
      targets: p,
      alpha: { from: 0.35, to: 1 },
      duration: 140,
      yoyo: true,
      onComplete: () => {
        onDone();
      }
    });
  };

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("memory")) {
      return;
    }
    ended = true;
    pads.forEach((p) => p.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0x69f0ae);
    } else {
      scene.cameras.main.shake(200, 0.008);
      tweenFlash(scene, 0xc62828);
    }
    scheduleFinish(ctx, 580, ok, cleanup, "memory");
  };

  for (let i = 0; i < 4; i++) {
    const p = scene.add
      .circle(positions[i].x, positions[i].y, padR, colors[i], 0.75)
      .setStrokeStyle(4, 0xffffff, 0.6)
      .setDepth(10);
    p.setInteractive({ useHandCursor: true });
    const idx = i;
    p.on("pointerup", () => {
      if (!inputPhase || ended || destroyed) {
        return;
      }
      if (seq[step] !== idx) {
        finish(false);
        return;
      }
      step++;
      flashPad(idx, () => undefined);
      if (step >= seq.length) {
        finish(true);
      }
    });
    pads.push(p);
    layers.push(p);
  }

  let seqStep = 0;
  const playNext = () => {
    if (destroyed || ended || !ctx.active("memory")) {
      return;
    }
    if (seqStep >= seq.length) {
      inputPhase = true;
      hint.setText("Your turn — repeat it");
      return;
    }
    flashPad(seq[seqStep], () => {
      seqStep++;
      scene.time.delayedCall(160, playNext);
    });
  };

  scene.time.delayedCall(400, playNext);

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountFindDifferent(ctx: MountCtx, game: FindDifferentMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;

  game.resetRound();

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x0d1318, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.22, "ODD ONE OUT", {
      fontSize: "40px",
      color: "#ce93d8",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const hint = scene.add
    .text(width / 2, height * 0.3, "One circle is slightly different — find it", {
      fontSize: "14px",
      color: "#e1bee7",
      fontFamily: "Segoe UI, Roboto, Arial"
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, hint);

  const cy = height * 0.55;
  const gap = width * 0.06;
  const r = 44;
  const total = r * 8 + gap * 3;
  const startX = width / 2 - total / 2 + r;

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("findDifferent")) {
      return;
    }
    ended = true;
    circles.forEach((c) => c.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0xe1bee7);
    } else {
      scene.cameras.main.shake(160, 0.006);
      tweenFlash(scene, 0xb71c1c);
    }
    scheduleFinish(ctx, 540, ok, cleanup, "findDifferent");
  };

  const circles: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < 4; i++) {
    const odd = i === game.oddIndex;
    const c = scene.add
      .circle(startX + i * (r * 2 + gap), cy, r, 0x7e57c2, 0.75)
      .setStrokeStyle(odd ? 5 : 2, 0xffffff, odd ? 0.95 : 0.45)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    c.on("pointerup", () => finish(i === game.oddIndex));
    circles.push(c);
    layers.push(c);
  }

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}

export function mountMatchPair(ctx: MountCtx, game: MatchPairMinigame): CleanupFn {
  const scene = ctx.scene;
  const layers: Phaser.GameObjects.GameObject[] = [];
  let destroyed = false;
  let ended = false;
  let busy = false;

  const deck = game.deal();
  /** Kalıcı olarak eşleşti */
  const matched = [false, false, false, false];
  let firstPick: number | null = null;

  const { width, height } = scene.scale;
  const bg = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x061210, 0.97)
    .setDepth(-8);
  pushLayers(layers, bg);

  const title = scene.add
    .text(width / 2, height * 0.22, "PAIR MATCH", {
      fontSize: "40px",
      color: "#a7ffeb",
      fontFamily: "Segoe UI, Roboto, Arial",
      stroke: "#050816",
      strokeThickness: 8
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, title);

  const hint = scene.add
    .text(width / 2, height * 0.3, "İki çifti bul — eşleşmeyen kartlar kapanır", {
      fontSize: "14px",
      color: "#b2dfdb",
      fontFamily: "Segoe UI, Roboto, Arial"
    })
    .setOrigin(0.5)
    .setDepth(8);
  pushLayers(layers, hint);

  const cx = width / 2;
  const cy = height * 0.56;
  const tw = 108;
  const th = 124;
  const gap = 20;
  const positions = [
    { x: cx - tw / 2 - gap / 2, y: cy - th / 2 - gap / 2 },
    { x: cx + gap / 2 + tw / 2, y: cy - th / 2 - gap / 2 },
    { x: cx - tw / 2 - gap / 2, y: cy + gap / 2 + th / 2 },
    { x: cx + gap / 2 + tw / 2, y: cy + gap / 2 + th / 2 }
  ];

  const finish = (ok: boolean) => {
    if (ended || destroyed || !ctx.active("matchPair")) {
      return;
    }
    ended = true;
    tiles.forEach((t) => t.container.disableInteractive());
    if (ok) {
      tweenFlash(scene, 0x1de9b6);
    } else {
      scene.cameras.main.shake(170, 0.007);
      tweenFlash(scene, 0xc62828);
    }
    scheduleFinish(ctx, 560, ok, cleanup, "matchPair");
  };

  const tiles: {
    container: Phaser.GameObjects.Container;
    label: Phaser.GameObjects.Text;
  }[] = [];

  for (let i = 0; i < 4; i++) {
    const cont = scene.add.container(positions[i].x, positions[i].y);
    const back = scene.add
      .rectangle(0, 0, tw, th, 0x004d40, 0.92)
      .setStrokeStyle(3, 0x26a69a, 0.8);
    const label = scene.add
      .text(0, 0, "?", {
        fontSize: "44px",
        color: "#e0f2f1",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5);
    cont.add([back, label]);
    cont.setDepth(10);
    cont.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-tw / 2, -th / 2, tw, th),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });

    const idx = i;
    const sym = deck[i];

    cont.on("pointerup", () => {
      if (ended || destroyed || busy || matched[idx]) {
        return;
      }

      if (firstPick === null) {
        firstPick = idx;
        label.setText(sym);
        return;
      }

      if (firstPick === idx) {
        return;
      }

      label.setText(sym);

      const other = firstPick;
      firstPick = null;

      if (deck[other] === deck[idx]) {
        matched[other] = true;
        matched[idx] = true;
        tiles[other].label.setAlpha(0.55);
        tiles[idx].label.setAlpha(0.55);
        if (matched.every((m) => m)) {
          finish(true);
        }
        return;
      }

      busy = true;
      scene.time.delayedCall(550, () => {
        busy = false;
        if (destroyed || ended) {
          return;
        }
        tiles[other].label.setText("?");
        tiles[idx].label.setText("?");
      });
    });

    tiles.push({ container: cont, label });
    layers.push(cont);
  }

  function cleanup() {
    if (destroyed) {
      return;
    }
    destroyed = true;
    layers.forEach((o) => o.destroy());
  }

  return cleanup;
}
