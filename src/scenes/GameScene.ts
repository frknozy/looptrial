import Phaser from "phaser";
import { LevelManager } from "../core/managers/LevelManager";
import { MinigameId, MinigameManager } from "../core/managers/MinigameManager";
import {
  PenaltyMinigame,
  PenaltyShotChoice
} from "../minigames/penalty/PenaltyMinigame";
import { ReactionMinigame } from "../minigames/reaction/ReactionMinigame";
import { DodgeMinigame } from "../minigames/dodge/DodgeMinigame";
import { DoubleTapMinigame } from "../minigames/doubletap/DoubleTapMinigame";

export class GameScene extends Phaser.Scene {
  private levelManager!: LevelManager;
  private minigameManager!: MinigameManager;
  private penaltyMinigame!: PenaltyMinigame;
  private reactionMinigame!: ReactionMinigame;
  private dodgeMinigame!: DodgeMinigame;
  private doubleTapMinigame!: DoubleTapMinigame;
  private currentMinigame!: MinigameId;
  private levelText!: Phaser.GameObjects.Text;
  private minigameText!: Phaser.GameObjects.Text;
  private penaltyHintText!: Phaser.GameObjects.Text;
  private penaltyGoalBar?: Phaser.GameObjects.Rectangle;
  private penaltyGoalArea?: Phaser.GameObjects.Rectangle;
  private penaltyGoalGlow?: Phaser.GameObjects.Rectangle;
  private penaltyGoalPosts?: Phaser.GameObjects.Rectangle[];
  private penaltyBackdropLayers: Phaser.GameObjects.GameObject[] = [];
  private penaltySpotlights: Phaser.GameObjects.Arc[] = [];
  private penaltySpotlightTweens: Phaser.Tweens.Tween[] = [];
  private penaltyTargets: Phaser.GameObjects.Container[] = [];
  private penaltyBall?: Phaser.GameObjects.Arc;
  private penaltyBallGlow?: Phaser.GameObjects.Arc;
  private penaltyBallTrailTimer?: Phaser.Time.TimerEvent;
  private penaltyTrailDots: Phaser.GameObjects.Arc[] = [];
  private penaltyPlayer?: Phaser.GameObjects.Container;
  private penaltyKickLeg?: Phaser.GameObjects.Rectangle;
  private penaltyKickLegBaseRotation = 0;
  private penaltyKickLegBaseY = 0;
  private penaltyKeeper?: Phaser.GameObjects.Container;
  private penaltyKeeperIdleLeftX?: number;
  private penaltyKeeperIdleRightX?: number;
  private penaltyKeeperIdleTween?: Phaser.Tweens.Tween;
  private penaltyFeedbackText?: Phaser.GameObjects.Text;
  private penaltyFeedbackTween?: Phaser.Tweens.Tween;
  private penaltyResolveTimer?: Phaser.Time.TimerEvent;
  private penaltyInputLocked = false;

  private reactionBackdrop?: Phaser.GameObjects.Rectangle;
  private reactionMainText?: Phaser.GameObjects.Text;
  private reactionInstructionText?: Phaser.GameObjects.Text;
  private reactionFeedbackText?: Phaser.GameObjects.Text;
  private reactionOverlay?: Phaser.GameObjects.Rectangle;
  private reactionHitZoneBorder?: Phaser.GameObjects.Rectangle;
  private reactionHitZoneFill?: Phaser.GameObjects.Rectangle;
  private reactionFlash?: Phaser.GameObjects.Rectangle;
  private reactionNowPulse?: Phaser.Tweens.Tween;
  private reactionFlashTween?: Phaser.Tweens.Tween;
  private reactionFeedbackTween?: Phaser.Tweens.Tween;
  private reactionWaitTimer?: Phaser.Time.TimerEvent;
  private reactionLateTimer?: Phaser.Time.TimerEvent;
  private reactionEnded = false;
  private reactionPointerHandler?: () => void;
  private reactionSpaceHandler?: () => void;

  private dodgeBackdrop: Phaser.GameObjects.GameObject[] = [];
  private dodgeArenaOuter?: Phaser.GameObjects.Rectangle;
  private dodgeArenaInner?: Phaser.GameObjects.Rectangle;
  private dodgeTitleText?: Phaser.GameObjects.Text;
  private dodgeInstrText?: Phaser.GameObjects.Text;
  private dodgeTimerBarBg?: Phaser.GameObjects.Rectangle;
  private dodgeTimerBarFill?: Phaser.GameObjects.Rectangle;
  private dodgeTimerBarGlow?: Phaser.GameObjects.Rectangle;
  private dodgeCountdownText?: Phaser.GameObjects.Text;
  private dodgeFeedbackText?: Phaser.GameObjects.Text;
  private dodgePlayerRoot?: Phaser.GameObjects.Container;
  private dodgeObstacles: Phaser.GameObjects.Rectangle[] = [];
  private dodgeSpawnTimer?: Phaser.Time.TimerEvent;
  private dodgeRoundTimer?: Phaser.Time.TimerEvent;
  private dodgeCountdownTimer?: Phaser.Time.TimerEvent;
  private dodgeFeedbackTween?: Phaser.Tweens.Tween;
  private dodgePhase: "off" | "countdown" | "play" | "end" = "off";
  private dodgeEnded = false;
  private dodgeRoundDurationMs = 0;
  private dodgeRoundStartAt = 0;
  private dodgeArenaLeft = 0;
  private dodgeArenaRight = 0;
  private dodgeArenaTop = 0;
  private dodgeArenaBottom = 0;
  private dodgePlayerRadius = 16;
  private dodgeKeys?: {
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
  };
  private readonly boundDodgeUpdate = (_time: number, delta: number) => {
    this.tickDodge(delta);
  };

  private doubleTapLayers: Phaser.GameObjects.GameObject[] = [];
  private doubleTapTitle?: Phaser.GameObjects.Text;
  private doubleTapHint?: Phaser.GameObjects.Text;
  private doubleTapOrb1?: Phaser.GameObjects.Container;
  private doubleTapOrb2?: Phaser.GameObjects.Container;
  private doubleTapOrb2Pulse?: Phaser.Tweens.Tween;
  private doubleTapFuseGlow?: Phaser.GameObjects.Rectangle;
  private doubleTapFuseBg?: Phaser.GameObjects.Rectangle;
  private doubleTapFuseFill?: Phaser.GameObjects.Rectangle;
  private doubleTapFuseTween?: Phaser.Tweens.Tween;
  private doubleTapOverlay?: Phaser.GameObjects.Rectangle;
  private doubleTapFeedback?: Phaser.GameObjects.Text;
  private doubleTapFeedbackTween?: Phaser.Tweens.Tween;
  private doubleTapWindowTimer?: Phaser.Time.TimerEvent;
  private doubleTapRound: "first" | "second" = "first";
  private doubleTapEnded = false;
  private doubleTapPointerHandler?: () => void;
  private doubleTapSpaceHandler?: () => void;

  constructor() {
    super("GameScene");
  }

  create(): void {
    const { width, height } = this.scale;
    this.levelManager = new LevelManager();
    this.minigameManager = new MinigameManager();
    this.penaltyMinigame = new PenaltyMinigame();
    this.reactionMinigame = new ReactionMinigame();
    this.dodgeMinigame = new DodgeMinigame();
    this.doubleTapMinigame = new DoubleTapMinigame();
    this.currentMinigame = this.minigameManager.pickRandomMinigame();

    this.levelText = this.add
      .text(26, 22, "", {
        fontSize: "16px",
        color: "#cfe8ff",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0, 0)
      .setAlpha(0.92)
      .setShadow(0, 0, "#00e5ff", 12, true, true);
    this.minigameText = this.add
      .text(width - 26, 22, "", {
        fontSize: "14px",
        color: "#d7c7ff",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(1, 0)
      .setAlpha(0.85)
      .setShadow(0, 0, "#b388ff", 10, true, true);
    this.penaltyHintText = this.add
      .text(width / 2, height - 34, "", {
        fontSize: "15px",
        color: "#eafcff",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setShadow(0, 0, "#00e5ff", 18, true, true);
    this.updateLevelText();
    this.updateMinigameText();

    this.input.keyboard?.on("keydown-SPACE", this.handleGlobalSpacePress, this);

    this.input.keyboard?.on("keydown-F", () => {
      this.levelManager.resetLevel();
      this.scene.start("GameOverScene");
    });
  }

  private updateLevelText(): void {
    this.levelText.setText(`Level ${this.levelManager.getLevel()}`);
  }

  private updateMinigameText(): void {
    this.minigameText.setText(`Minigame: ${this.currentMinigame}`);
    if (this.currentMinigame === "penalty") {
      this.penaltyHintText.setText("Choose your shot");
      this.tweens.add({
        targets: this.penaltyHintText,
        alpha: 0.92,
        duration: 220,
        ease: "Sine.easeOut"
      });
    } else {
      this.tweens.add({
        targets: this.penaltyHintText,
        alpha: 0,
        duration: 160,
        ease: "Sine.easeIn",
        onComplete: () => {
          this.penaltyHintText.setText("");
        }
      });
    }
    this.renderMinigameUi();
  }

  private handleSuccess(): void {
    const next = this.levelManager.nextLevel();
    if (next > this.levelManager.getMaxLevel()) {
      this.scene.start("VictoryScene");
      return;
    }

    this.currentMinigame = this.minigameManager.pickRandomMinigame();
    this.updateLevelText();
    this.updateMinigameText();
  }

  private renderMinigameUi(): void {
    this.clearReactionUi();
    this.clearDodgeUi();
    this.clearDoubleTapUi();
    this.renderPenaltyUi();

    if (this.currentMinigame === "reaction") {
      this.renderReactionUi();
    } else if (this.currentMinigame === "dodge") {
      this.renderDodgeUi();
    } else if (this.currentMinigame === "doubleTap") {
      this.renderDoubleTapUi();
    }
  }

  private renderPenaltyUi(): void {
    this.clearPenaltyUi();

    if (this.currentMinigame !== "penalty") {
      return;
    }

    this.penaltyInputLocked = false;

    const { width, height } = this.scale;
    this.buildPenaltyStadiumBackdrop(width, height);

    const goalCenterX = width / 2;
    const goalTopY = 70;
    const goalBarHeight = 14;
    const goalAreaHeight = 170;
    const goalAreaTop = goalTopY + goalBarHeight / 2 + goalAreaHeight / 2;
    const goalLeft = goalCenterX - 260;
    const goalRight = goalCenterX + 260;

    this.penaltyGoalGlow = this.add
      .rectangle(goalCenterX, goalTopY, 540, goalBarHeight + 18, 0x00e5ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-6);

    this.penaltyGoalBar = this.add
      .rectangle(goalCenterX, goalTopY, 520, goalBarHeight, 0xeafcff, 0.92)
      .setStrokeStyle(4, 0x00e5ff, 1)
      .setDepth(-5);

    this.penaltyGoalArea = this.add
      .rectangle(goalCenterX, goalAreaTop, 520, goalAreaHeight, 0x1de9b6, 0.08)
      .setStrokeStyle(2, 0x80deea, 0.55)
      .setDepth(-5);

    this.penaltyGoalPosts = [
      this.add.rectangle(goalLeft, goalAreaTop, 10, goalAreaHeight + goalBarHeight, 0xcfd8dc).setStrokeStyle(2, 0x00e5ff).setDepth(-4),
      this.add.rectangle(goalRight, goalAreaTop, 10, goalAreaHeight + goalBarHeight, 0xcfd8dc).setStrokeStyle(2, 0x00e5ff).setDepth(-4)
    ];

    const innerPadding = 28;
    const innerLeft = goalLeft + innerPadding;
    const innerRight = goalRight - innerPadding;
    const innerTop = goalAreaTop - goalAreaHeight / 2 + innerPadding + 18;
    const innerBottom = goalAreaTop + goalAreaHeight / 2 - innerPadding - 18;

    const colGap = (innerRight - innerLeft) / 2;
    const rowGap = (innerBottom - innerTop) / 2;

    const targetPositions: Record<PenaltyShotChoice, { x: number; y: number }> = {
      topLeft: { x: innerLeft + colGap * 0, y: innerTop },
      topRight: { x: innerLeft + colGap * 2, y: innerTop },
      center: { x: innerLeft + colGap * 1, y: innerTop + rowGap },
      bottomLeft: { x: innerLeft + colGap * 0, y: innerBottom },
      bottomRight: { x: innerLeft + colGap * 2, y: innerBottom }
    };

    const keeperStartX = goalCenterX;
    const keeperStartY = goalAreaTop + 8;

    this.penaltyKeeper = this.createPenaltyKeeperFigure(keeperStartX, keeperStartY);
    this.penaltyKeeper.setDepth(3);

    const ballX = goalCenterX;
    const ballY = height - 70;
    this.penaltyPlayer = this.createPenaltyPlayerFigure(ballX, ballY);
    this.penaltyPlayer.setDepth(1);

    this.penaltyBallGlow = this.add
      .circle(ballX, ballY, 22, 0x00e5ff, 0.14)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(4);

    this.penaltyBall = this.add.circle(ballX, ballY, 13, 0xffffff)
      .setStrokeStyle(3, 0x80deea)
      .setDepth(5);

    this.startPenaltyKeeperIdle(keeperStartX);

    this.penaltyMinigame.getOptions().forEach((choice) => {
      const pos = targetPositions[choice];
      const root = this.add.container(pos.x, pos.y);

      const glow = this.add.circle(0, 0, 26, 0x00e5ff, 0.06).setBlendMode(Phaser.BlendModes.ADD);
      const ringOuter = this.add.circle(0, 0, 22, 0x000000, 0.001).setStrokeStyle(2, 0x00e5ff, 0.55);
      const ringInner = this.add.circle(0, 0, 15, 0x7c4dff, 0.08).setStrokeStyle(2, 0xb388ff, 0.45);

      root.add([glow, ringInner, ringOuter]);
      root.setSize(52, 52);
      root.setInteractive({ useHandCursor: true });

      root.setData("baseScale", 1);
      root.setData("glow", glow);
      root.setData("ringOuter", ringOuter);
      root.setData("ringInner", ringInner);

      root.on("pointerover", () => {
        if (this.penaltyInputLocked) {
          return;
        }

        this.tweens.add({
          targets: root,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 90,
          ease: "Sine.easeOut"
        });
        glow.setAlpha(0.22);
        ringOuter.setStrokeStyle(3, 0x00e5ff, 0.85);
        ringInner.setStrokeStyle(2, 0xffea00, 0.65);
      });

      root.on("pointerout", () => {
        if (this.penaltyInputLocked) {
          return;
        }

        const baseScale = root.getData("baseScale") as number;
        this.tweens.add({
          targets: root,
          scaleX: baseScale,
          scaleY: baseScale,
          duration: 90,
          ease: "Sine.easeOut"
        });
        glow.setAlpha(0.06);
        ringOuter.setStrokeStyle(2, 0x00e5ff, 0.55);
        ringInner.setStrokeStyle(2, 0xb388ff, 0.45);
      });

      root.on("pointerup", () => {
        this.handlePenaltyShot(choice, pos.x, pos.y);
      });

      root.setDepth(2);
      this.penaltyTargets.push(root);
    });
  }

  private handleGlobalSpacePress(): void {
    if (this.currentMinigame === "penalty") {
      return;
    }

    if (this.currentMinigame === "reaction") {
      return;
    }

    if (this.currentMinigame === "dodge") {
      return;
    }

    if (this.currentMinigame === "doubleTap") {
      return;
    }

    this.handleSuccess();
  }

  private renderReactionUi(): void {
    this.clearReactionUi();

    const { width, height } = this.scale;

    this.reactionBackdrop = this.add
      .rectangle(width / 2, height / 2, width, height, 0x050816, 0.55)
      .setDepth(-12);

    this.reactionFlash = this.add
      .rectangle(width / 2, height / 2, width, height, 0xffffff, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(9);

    this.reactionHitZoneFill = this.add
      .rectangle(width / 2, height / 2 + 40, width - 140, height - 210, 0x00e5ff, 0.05)
      .setStrokeStyle(2, 0x00e5ff, 0.18)
      .setDepth(10);

    this.reactionHitZoneBorder = this.add
      .rectangle(width / 2, height / 2 + 40, width - 140, height - 210, 0x000000, 0.0001)
      .setStrokeStyle(2, 0x00e5ff, 0.35)
      .setDepth(10);

    this.reactionMainText = this.add
      .text(width / 2, height / 2 - 70, "", {
        fontSize: "76px",
        color: "#eafcff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 10
      })
      .setOrigin(0.5)
      .setAlpha(0.98)
      .setShadow(0, 0, "#00e5ff", 26, true, true)
      .setDepth(12);

    this.reactionInstructionText = this.add
      .text(width / 2, height / 2 + 10, "", {
        fontSize: "18px",
        color: "#b0bec5",
        fontFamily: "Segoe UI, Roboto, Arial",
        fontStyle: "italic"
      })
      .setOrigin(0.5)
      .setAlpha(0.9)
      .setDepth(12);

    this.reactionFeedbackText = this.add
      .text(width / 2, height / 2 + 120, "", {
        fontSize: "34px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(13);

    this.reactionOverlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    this.reactionEnded = false;
    this.reactionMinigame.configure(this.levelManager.getLevel());
    const { waitDelayMs } = this.reactionMinigame.startRound(this.time.now);

    this.reactionMainText.setText("WAIT...");
    this.reactionInstructionText.setText("Don’t click yet");
    this.reactionFeedbackText.setText("");

    this.reactionHitZoneFill?.setAlpha(0.09);
    this.reactionHitZoneBorder?.setStrokeStyle(2, 0x00e5ff, 0.22);

    this.reactionPointerHandler = () => {
      this.handleReactionInput();
    };

    this.reactionSpaceHandler = () => {
      this.handleReactionInput();
    };

    this.reactionOverlay.on("pointerdown", this.reactionPointerHandler);
    this.input.keyboard?.on("keydown-SPACE", this.reactionSpaceHandler);

    this.reactionWaitTimer = this.time.delayedCall(waitDelayMs, () => {
      if (this.reactionEnded) {
        return;
      }

      this.reactionMainText?.setText("NOW!");
      this.reactionMainText?.setColor("#39ff14");
      this.reactionMainText?.setShadow(0, 0, "#39ff14", 34, true, true);
      this.reactionInstructionText?.setText("CLICK / SPACE — GO!");
      this.reactionInstructionText?.setColor("#c8e6c9");

      this.reactionHitZoneFill?.setFillStyle(0x39ff14, 0.08);
      this.reactionHitZoneBorder?.setStrokeStyle(3, 0x39ff14, 0.75);

      this.triggerReactionNowFlash();
      this.startReactionHitZonePulse();

      this.reactionMinigame.markNowShown(this.time.now);

      const windowMs = this.reactionMinigame.getWindowMs();

      this.reactionLateTimer?.remove(false);
      this.reactionLateTimer = this.time.delayedCall(windowMs, () => {
        const lateResult = this.reactionMinigame.endIfLate(this.time.now);
        if (!lateResult) {
          return;
        }
        this.finishReactionRound(lateResult);
      });
    });
  }

  private triggerReactionNowFlash(): void {
    if (!this.reactionFlash) {
      return;
    }

    this.reactionFlashTween?.stop();
    this.reactionFlash.setAlpha(0);

    this.reactionFlashTween = this.tweens.add({
      targets: this.reactionFlash,
      alpha: { from: 0, to: 0.22 },
      duration: 70,
      ease: "Cubic.easeOut",
      yoyo: true,
      hold: 40,
      onComplete: () => {
        this.reactionFlash?.setAlpha(0);
      }
    });
  }

  private startReactionHitZonePulse(): void {
    if (!this.reactionHitZoneBorder) {
      return;
    }

    this.reactionNowPulse?.stop();

    this.reactionNowPulse = this.tweens.add({
      targets: this.reactionHitZoneBorder,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 420,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });
  }

  private stopReactionNowPresentation(): void {
    this.reactionFlashTween?.stop();
    this.reactionFlashTween = undefined;
    this.reactionFlash?.setAlpha(0);

    this.reactionNowPulse?.stop();
    this.reactionNowPulse = undefined;
    this.reactionHitZoneBorder?.setScale(1);
  }

  private handleReactionInput(): void {
    if (this.currentMinigame !== "reaction" || this.reactionEnded) {
      return;
    }

    const result = this.reactionMinigame.attempt(this.time.now);
    if (result === "too_early") {
      this.flashReactionFeedback("TOO EARLY!", "fail");
      this.finishReactionRound("too_early");
      return;
    }

    if (result === "too_late") {
      this.flashReactionFeedback("TOO LATE!", "miss");
      this.finishReactionRound("too_late");
      return;
    }

    if (result === "success") {
      this.flashReactionFeedback("PERFECT!", "success");
      this.finishReactionRound("success");
    }
  }

  private flashReactionFeedback(
    message: string,
    kind: "success" | "fail" | "miss"
  ): void {
    if (!this.reactionFeedbackText) {
      return;
    }

    this.reactionFeedbackTween?.stop();

    this.reactionFeedbackText.setText(message);
    this.reactionFeedbackText.setAlpha(0);
    this.reactionFeedbackText.setScale(0.92);

    const baseStroke = "#050816";

    if (kind === "success") {
      this.reactionFeedbackText.setColor("#39ff14");
      this.reactionFeedbackText.setShadow(0, 0, "#39ff14", 28, true, true);
    } else if (kind === "fail") {
      this.reactionFeedbackText.setColor("#ff1744");
      this.reactionFeedbackText.setShadow(0, 0, "#ff1744", 26, true, true);
    } else {
      this.reactionFeedbackText.setColor("#ff9100");
      this.reactionFeedbackText.setShadow(0, 0, "#ff9100", 22, true, true);
    }

    this.reactionFeedbackText.setStroke(baseStroke, 8);

    if (kind === "fail" || kind === "miss") {
      this.tweens.add({
        targets: this.reactionFeedbackText,
        x: "+=6",
        duration: 45,
        yoyo: true,
        repeat: 5,
        ease: "Sine.easeInOut"
      });
    }

    this.reactionFeedbackTween = this.tweens.add({
      targets: this.reactionFeedbackText,
      alpha: 1,
      scale: kind === "success" ? 1.08 : 1,
      duration: kind === "success" ? 160 : 130,
      ease: "Back.easeOut",
      onComplete: () => {
        this.reactionFeedbackTween = this.tweens.add({
          targets: this.reactionFeedbackText,
          alpha: 0,
          scale: kind === "success" ? 1 : 0.96,
          duration: 240,
          ease: "Cubic.easeIn",
          delay: kind === "success" ? 120 : 60
        });
      }
    });
  }

  private finishReactionRound(result: "success" | "too_early" | "too_late"): void {
    if (this.reactionEnded) {
      return;
    }

    this.reactionEnded = true;
    this.reactionWaitTimer?.remove(false);
    this.reactionWaitTimer = undefined;
    this.reactionLateTimer?.remove(false);
    this.reactionLateTimer = undefined;

    this.stopReactionNowPresentation();

    this.reactionOverlay?.disableInteractive();

    if (this.reactionPointerHandler && this.reactionOverlay) {
      this.reactionOverlay.off("pointerdown", this.reactionPointerHandler);
      this.reactionPointerHandler = undefined;
    }

    if (this.reactionSpaceHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.reactionSpaceHandler);
      this.reactionSpaceHandler = undefined;
    }

    this.time.delayedCall(420, () => {
      this.clearReactionUi();

      if (result === "success") {
        this.handleSuccess();
        return;
      }

      this.levelManager.resetLevel();
      this.scene.start("GameOverScene");
    });
  }

  private clearReactionUi(): void {
    this.reactionWaitTimer?.remove(false);
    this.reactionWaitTimer = undefined;
    this.reactionLateTimer?.remove(false);
    this.reactionLateTimer = undefined;

    this.reactionFeedbackTween?.stop();
    this.reactionFeedbackTween = undefined;

    this.stopReactionNowPresentation();

    if (this.reactionPointerHandler && this.reactionOverlay) {
      this.reactionOverlay.off("pointerdown", this.reactionPointerHandler);
    }
    this.reactionPointerHandler = undefined;

    if (this.reactionSpaceHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.reactionSpaceHandler);
    }
    this.reactionSpaceHandler = undefined;

    if (this.reactionBackdrop) {
      this.reactionBackdrop.destroy();
      this.reactionBackdrop = undefined;
    }

    if (this.reactionFlash) {
      this.reactionFlash.destroy();
      this.reactionFlash = undefined;
    }

    if (this.reactionHitZoneFill) {
      this.reactionHitZoneFill.destroy();
      this.reactionHitZoneFill = undefined;
    }

    if (this.reactionHitZoneBorder) {
      this.reactionHitZoneBorder.destroy();
      this.reactionHitZoneBorder = undefined;
    }

    if (this.reactionMainText) {
      this.reactionMainText.destroy();
      this.reactionMainText = undefined;
    }

    if (this.reactionInstructionText) {
      this.reactionInstructionText.destroy();
      this.reactionInstructionText = undefined;
    }

    if (this.reactionFeedbackText) {
      this.reactionFeedbackText.destroy();
      this.reactionFeedbackText = undefined;
    }

    if (this.reactionOverlay) {
      this.reactionOverlay.destroy();
      this.reactionOverlay = undefined;
    }

    this.reactionEnded = false;
    this.reactionMinigame.reset();
  }

  private renderDodgeUi(): void {
    this.clearDodgeUi();

    const { width, height } = this.scale;
    this.dodgeMinigame.configure(this.levelManager.getLevel());

    const bgA = this.add
      .rectangle(width / 2, height * 0.35, width, height * 0.75, 0x1a0528, 0.92)
      .setDepth(-14);
    const bgB = this.add
      .rectangle(width / 2, height * 0.82, width, height * 0.45, 0x12021f, 0.95)
      .setDepth(-14);
    const vignette = this.add
      .circle(width / 2, height / 2, Math.max(width, height) * 0.55, 0x000000, 0.28)
      .setDepth(-13);
    this.dodgeBackdrop.push(bgA, bgB, vignette);

    const pad = this.dodgeMinigame.getArenaPadding();
    const arenaW = width - pad * 2;
    const arenaH = height * 0.5;
    const arenaCx = width / 2;
    const arenaCy = height * 0.48;

    this.dodgeArenaLeft = arenaCx - arenaW / 2;
    this.dodgeArenaRight = arenaCx + arenaW / 2;
    this.dodgeArenaTop = arenaCy - arenaH / 2;
    this.dodgeArenaBottom = arenaCy + arenaH / 2;

    this.dodgeArenaOuter = this.add
      .rectangle(arenaCx, arenaCy, arenaW + 24, arenaH + 24, 0xff00aa, 0.08)
      .setStrokeStyle(4, 0xff00aa, 0.65)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-11);

    this.dodgeArenaInner = this.add
      .rectangle(arenaCx, arenaCy, arenaW, arenaH, 0x0a0612, 0.82)
      .setStrokeStyle(2, 0xaa44ff, 0.45)
      .setDepth(-10);

    this.dodgeTitleText = this.add
      .text(arenaCx, this.dodgeArenaTop - 36, "DODGE RUSH", {
        fontSize: "22px",
        color: "#ffc6ff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setAlpha(0.95)
      .setShadow(0, 0, "#ff00aa", 16, true, true)
      .setDepth(8);

    const barW = arenaW - 40;
    const barY = this.dodgeArenaTop + 18;

    this.dodgeTimerBarGlow = this.add
      .rectangle(arenaCx, barY, barW + 16, 16, 0xff00aa, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(7);

    this.dodgeTimerBarBg = this.add
      .rectangle(arenaCx, barY, barW, 10, 0x1e1030, 0.95)
      .setStrokeStyle(2, 0xaa44ff, 0.55)
      .setOrigin(0.5)
      .setDepth(8);

    this.dodgeTimerBarFill = this.add
      .rectangle(this.dodgeArenaLeft + 20, barY, barW, 10, 0x39ff14, 0.85)
      .setStrokeStyle(2, 0xb9f6ca, 0.65)
      .setOrigin(0, 0.5)
      .setDepth(9);

    this.dodgeInstrText = this.add
      .text(arenaCx, this.dodgeArenaBottom + 52, "← → or A / D  ·  survive the red hail", {
        fontSize: "15px",
        color: "#e1bee7",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5)
      .setAlpha(0.88)
      .setShadow(0, 0, "#aa44ff", 10, true, true)
      .setDepth(8);

    this.dodgeFeedbackText = this.add
      .text(arenaCx, arenaCy, "", {
        fontSize: "46px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 10
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);

    this.dodgeCountdownText = this.add
      .text(arenaCx, arenaCy, "", {
        fontSize: "110px",
        color: "#ffe6ff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 12
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(18);

    this.dodgePlayerRadius = this.dodgeMinigame.getPlayerRadius();
    const startX = arenaCx;
    const startY = this.dodgeArenaBottom - this.dodgePlayerRadius - 14;

    this.dodgePlayerRoot = this.add.container(startX, startY);
    const glow = this.add
      .circle(0, 0, this.dodgePlayerRadius + 10, 0x00e5ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    const body = this.add
      .circle(0, 0, this.dodgePlayerRadius, 0x26c6da)
      .setStrokeStyle(3, 0xffffff);
    this.dodgePlayerRoot.add([glow, body]);
    this.dodgePlayerRoot.setDepth(15);

    this.dodgeKeys = this.input.keyboard?.addKeys("A,D,LEFT,RIGHT") as {
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      LEFT: Phaser.Input.Keyboard.Key;
      RIGHT: Phaser.Input.Keyboard.Key;
    };

    this.dodgeEnded = false;
    this.dodgePhase = "countdown";
    this.dodgeRoundDurationMs = this.dodgeMinigame.getRoundDurationSec() * 1000;

    this.events.on("update", this.boundDodgeUpdate);

    this.runDodgeCountdown(3);
  }

  private runDodgeCountdown(from: number): void {
    if (from > 0) {
      this.dodgeCountdownText?.setText(String(from));
      this.dodgeCountdownText?.setAlpha(1);
      this.dodgeCountdownText?.setScale(0.4);

      this.tweens.add({
        targets: this.dodgeCountdownText,
        scale: 1,
        duration: 220,
        ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: this.dodgeCountdownText,
            alpha: 0,
            duration: 140,
            ease: "Cubic.easeIn",
            delay: 140
          });
        }
      });

      this.dodgeCountdownTimer = this.time.delayedCall(520, () => {
        this.runDodgeCountdown(from - 1);
      });
      return;
    }

    this.dodgeCountdownText?.setText("GO!");
    this.dodgeCountdownText?.setColor("#39ff14");
    this.dodgeCountdownText?.setShadow(0, 0, "#39ff14", 40, true, true);
    this.dodgeCountdownText?.setAlpha(1);
    this.dodgeCountdownText?.setScale(0.5);

    this.tweens.add({
      targets: this.dodgeCountdownText,
      scale: 1.15,
      duration: 180,
      ease: "Elastic.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.dodgeCountdownText,
          alpha: 0,
          duration: 160,
          ease: "Cubic.easeIn"
        });
      }
    });

    this.time.delayedCall(260, () => {
      this.beginDodgeRound();
    });
  }

  private beginDodgeRound(): void {
    if (this.currentMinigame !== "dodge" || this.dodgeEnded) {
      return;
    }

    this.dodgePhase = "play";
    this.dodgeRoundStartAt = this.time.now;

    const spawnMs = this.dodgeMinigame.getSpawnIntervalMs();

    this.time.delayedCall(120, () => {
      this.spawnDodgeObstacle();
    });

    this.dodgeSpawnTimer = this.time.addEvent({
      delay: spawnMs,
      loop: true,
      callback: () => {
        this.spawnDodgeObstacle();
      }
    });

    this.dodgeRoundTimer = this.time.delayedCall(this.dodgeRoundDurationMs, () => {
      this.finishDodgeRound(true);
    });
  }

  private spawnDodgeObstacle(): void {
    if (
      this.currentMinigame !== "dodge" ||
      this.dodgePhase !== "play" ||
      this.dodgeEnded
    ) {
      return;
    }

    const w = this.dodgeMinigame.randomObstacleWidth();
    const h = this.dodgeMinigame.getObstacleHeight();
    const half = w / 2;
    const minX = this.dodgeArenaLeft + half + 8;
    const maxX = this.dodgeArenaRight - half - 8;
    const x = Phaser.Math.FloatBetween(minX, maxX);
    const y = this.dodgeArenaTop - h;

    const obs = this.add
      .rectangle(x, y, w, h, 0xff1744, 0.92)
      .setStrokeStyle(3, 0xff8a80)
      .setDepth(12);

    obs.setData("vy", this.dodgeMinigame.getObstacleFallSpeed());
    obs.setScale(1, 0.35);

    this.tweens.add({
      targets: obs,
      scaleY: 1,
      duration: 140,
      ease: "Back.easeOut"
    });

    this.dodgeObstacles.push(obs);
  }

  private tickDodge(delta: number): void {
    if (this.currentMinigame !== "dodge" || this.dodgeEnded) {
      return;
    }

    if (this.dodgePhase === "countdown") {
      return;
    }

    if (this.dodgePhase !== "play") {
      return;
    }

    const dt = delta / 1000;
    const speed = this.dodgeMinigame.getPlayerMoveSpeed();

    let mx = 0;
    if (this.dodgeKeys) {
      if (this.dodgeKeys.A.isDown || this.dodgeKeys.LEFT.isDown) {
        mx -= 1;
      }
      if (this.dodgeKeys.D.isDown || this.dodgeKeys.RIGHT.isDown) {
        mx += 1;
      }
    }

    if (this.dodgePlayerRoot && mx !== 0) {
      this.dodgePlayerRoot.x += mx * speed * dt;
      const minX = this.dodgeArenaLeft + this.dodgePlayerRadius + 6;
      const maxX = this.dodgeArenaRight - this.dodgePlayerRadius - 6;
      this.dodgePlayerRoot.x = Phaser.Math.Clamp(
        this.dodgePlayerRoot.x,
        minX,
        maxX
      );
    }

    const playerBounds = this.dodgePlayerRoot?.getBounds();

    const fallMul = dt;
    for (let i = this.dodgeObstacles.length - 1; i >= 0; i--) {
      const obs = this.dodgeObstacles[i];
      const vy = obs.getData("vy") as number;
      obs.y += vy * fallMul;

      if (obs.y > this.dodgeArenaBottom + 80) {
        obs.destroy();
        this.dodgeObstacles.splice(i, 1);
        continue;
      }

      if (playerBounds) {
        const ob = obs.getBounds();
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            new Phaser.Geom.Rectangle(
              playerBounds.x,
              playerBounds.y,
              playerBounds.width,
              playerBounds.height
            ),
            new Phaser.Geom.Rectangle(ob.x, ob.y, ob.width, ob.height)
          )
        ) {
          this.finishDodgeRound(false);
          return;
        }
      }
    }

    const elapsed = this.time.now - this.dodgeRoundStartAt;
    const remain = Phaser.Math.Clamp(
      1 - elapsed / this.dodgeRoundDurationMs,
      0,
      1
    );
    if (this.dodgeTimerBarFill) {
      this.dodgeTimerBarFill.scaleX = remain;
    }
  }

  private finishDodgeRound(success: boolean): void {
    if (this.dodgeEnded || this.currentMinigame !== "dodge") {
      return;
    }

    this.dodgeEnded = true;
    this.dodgePhase = "end";

    this.dodgeSpawnTimer?.remove(false);
    this.dodgeSpawnTimer = undefined;
    this.dodgeRoundTimer?.remove(false);
    this.dodgeRoundTimer = undefined;
    this.dodgeCountdownTimer?.remove(false);
    this.dodgeCountdownTimer = undefined;

    this.events.off("update", this.boundDodgeUpdate);

    if (!success) {
      this.cameras.main.shake(220, 0.012);

      const flash = this.add
        .rectangle(
          this.scale.width / 2,
          this.scale.height / 2,
          this.scale.width,
          this.scale.height,
          0xff1744,
          0.18
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(19);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 280,
        ease: "Cubic.easeOut",
        onComplete: () => flash.destroy()
      });

      this.flashDodgeFeedback("HIT!", "fail");
    } else {
      const flash = this.add
        .rectangle(
          this.scale.width / 2,
          this.scale.height / 2,
          this.scale.width,
          this.scale.height,
          0x39ff14,
          0.12
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(19);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 320,
        ease: "Cubic.easeOut",
        onComplete: () => flash.destroy()
      });

      this.flashDodgeFeedback("CLEARED!", "success");
    }

    this.time.delayedCall(720, () => {
      this.clearDodgeUi();

      if (success) {
        this.handleSuccess();
        return;
      }

      this.levelManager.resetLevel();
      this.scene.start("GameOverScene");
    });
  }

  private flashDodgeFeedback(
    message: string,
    kind: "success" | "fail"
  ): void {
    if (!this.dodgeFeedbackText) {
      return;
    }

    this.dodgeFeedbackTween?.stop();

    this.dodgeFeedbackText.setText(message);
    this.dodgeFeedbackText.setAlpha(0);
    this.dodgeFeedbackText.setScale(0.85);

    if (kind === "success") {
      this.dodgeFeedbackText.setColor("#39ff14");
      this.dodgeFeedbackText.setShadow(0, 0, "#39ff14", 30, true, true);
    } else {
      this.dodgeFeedbackText.setColor("#ff1744");
      this.dodgeFeedbackText.setShadow(0, 0, "#ff1744", 28, true, true);
    }

    this.dodgeFeedbackTween = this.tweens.add({
      targets: this.dodgeFeedbackText,
      alpha: 1,
      scale: 1.12,
      duration: 160,
      ease: "Back.easeOut",
      onComplete: () => {
        this.dodgeFeedbackTween = this.tweens.add({
          targets: this.dodgeFeedbackText,
          alpha: 0,
          scale: 1,
          duration: 260,
          ease: "Cubic.easeIn",
          delay: 140
        });
      }
    });

    if (kind === "fail") {
      this.tweens.add({
        targets: this.dodgeFeedbackText,
        angle: { from: -4, to: 4 },
        duration: 55,
        yoyo: true,
        repeat: 6,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.dodgeFeedbackText?.setAngle(0);
        }
      });
    }
  }

  private clearDodgeUi(): void {
    this.dodgeSpawnTimer?.remove(false);
    this.dodgeSpawnTimer = undefined;
    this.dodgeRoundTimer?.remove(false);
    this.dodgeRoundTimer = undefined;
    this.dodgeCountdownTimer?.remove(false);
    this.dodgeCountdownTimer = undefined;

    this.dodgeFeedbackTween?.stop();
    this.dodgeFeedbackTween = undefined;

    this.events.off("update", this.boundDodgeUpdate);

    this.dodgeBackdrop.forEach((obj) => obj.destroy());
    this.dodgeBackdrop = [];

    if (this.dodgeArenaOuter) {
      this.dodgeArenaOuter.destroy();
      this.dodgeArenaOuter = undefined;
    }

    if (this.dodgeArenaInner) {
      this.dodgeArenaInner.destroy();
      this.dodgeArenaInner = undefined;
    }

    if (this.dodgeTitleText) {
      this.dodgeTitleText.destroy();
      this.dodgeTitleText = undefined;
    }

    if (this.dodgeInstrText) {
      this.dodgeInstrText.destroy();
      this.dodgeInstrText = undefined;
    }

    if (this.dodgeTimerBarGlow) {
      this.dodgeTimerBarGlow.destroy();
      this.dodgeTimerBarGlow = undefined;
    }

    if (this.dodgeTimerBarBg) {
      this.dodgeTimerBarBg.destroy();
      this.dodgeTimerBarBg = undefined;
    }

    if (this.dodgeTimerBarFill) {
      this.dodgeTimerBarFill.destroy();
      this.dodgeTimerBarFill = undefined;
    }

    if (this.dodgeCountdownText) {
      this.dodgeCountdownText.destroy();
      this.dodgeCountdownText = undefined;
    }

    if (this.dodgeFeedbackText) {
      this.dodgeFeedbackText.destroy();
      this.dodgeFeedbackText = undefined;
    }

    this.dodgeObstacles.forEach((o) => o.destroy());
    this.dodgeObstacles = [];

    if (this.dodgePlayerRoot) {
      this.dodgePlayerRoot.destroy();
      this.dodgePlayerRoot = undefined;
    }

    this.dodgeKeys = undefined;
    this.dodgePhase = "off";
    this.dodgeEnded = false;
  }

  private renderDoubleTapUi(): void {
    this.clearDoubleTapUi();

    const { width, height } = this.scale;
    this.doubleTapMinigame.configure(this.levelManager.getLevel());

    const warmBottom = this.add
      .rectangle(width / 2, height * 0.72, width, height * 0.56, 0x3e1306, 0.85)
      .setDepth(-15);
    const warmTop = this.add
      .rectangle(width / 2, height * 0.28, width, height * 0.52, 0x120805, 0.92)
      .setDepth(-15);
    const spotlight = this.add
      .ellipse(width / 2, height * 0.42, width * 0.85, height * 0.55, 0xff9100, 0.06)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-14);
    this.doubleTapLayers.push(warmBottom, warmTop, spotlight);

    const cx = width / 2;
    const cy = height * 0.46;

    this.doubleTapTitle = this.add
      .text(cx, cy - 120, "DOUBLE TAP", {
        fontSize: "52px",
        color: "#ffe082",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 10
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff6d00", 28, true, true)
      .setDepth(8);

    this.doubleTapHint = this.add
      .text(
        cx,
        cy - 48,
        "Tap once (or SPACE) to arm  ·  tap again before the fuse burns out",
        {
          fontSize: "15px",
          color: "#ffecb3",
          fontFamily: "Segoe UI, Roboto, Arial",
          align: "center",
          wordWrap: { width: width - 120 }
        }
      )
      .setOrigin(0.5)
      .setAlpha(0.92)
      .setDepth(8);

    const orbR = 38;

    this.doubleTapOrb1 = this.buildDoubleTapOrb(cx - 130, cy + 10, orbR, 0xffca28, "1");
    this.doubleTapOrb2 = this.buildDoubleTapOrb(cx + 130, cy + 10, orbR, 0x78909c, "2");
    this.doubleTapOrb1.setDepth(10);
    this.doubleTapOrb2.setDepth(10);

    const fuseW = Math.min(420, width - 160);
    const fuseY = cy + 72;
    const fuseLeft = cx - fuseW / 2;

    this.doubleTapFuseGlow = this.add
      .rectangle(cx, fuseY, fuseW + 18, 22, 0xff6d00, 0.18)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0)
      .setDepth(9);

    this.doubleTapFuseBg = this.add
      .rectangle(cx, fuseY, fuseW, 14, 0x2d1b0f, 0.92)
      .setStrokeStyle(2, 0xffab40, 0.55)
      .setAlpha(0)
      .setDepth(10);

    this.doubleTapFuseFill = this.add
      .rectangle(fuseLeft, fuseY, fuseW, 14, 0xff6d00, 0.95)
      .setStrokeStyle(2, 0xffe082, 0.65)
      .setOrigin(0, 0.5)
      .setAlpha(0)
      .setDepth(11);

    this.doubleTapFeedback = this.add
      .text(cx, cy + 140, "", {
        fontSize: "44px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 9
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);

    this.doubleTapOverlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    this.doubleTapRound = "first";
    this.doubleTapEnded = false;

    this.doubleTapPointerHandler = () => {
      this.handleDoubleTapInput();
    };

    this.doubleTapSpaceHandler = () => {
      this.handleDoubleTapInput();
    };

    this.doubleTapOverlay.on("pointerdown", this.doubleTapPointerHandler);
    this.input.keyboard?.on("keydown-SPACE", this.doubleTapSpaceHandler);

    this.tweens.add({
      targets: this.doubleTapTitle,
      scale: { from: 0.92, to: 1 },
      duration: 420,
      ease: "Elastic.easeOut"
    });
  }

  private buildDoubleTapOrb(
    x: number,
    y: number,
    radius: number,
    fill: number,
    label: string
  ): Phaser.GameObjects.Container {
    const root = this.add.container(x, y);
    const glow = this.add
      .circle(0, 0, radius + 14, fill, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD);
    const base = this.add.circle(0, 0, radius, fill, 0.35).setStrokeStyle(3, 0xffffff);
    const txt = this.add
      .text(0, 0, label, {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 6
      })
      .setOrigin(0.5);
    root.add([glow, base, txt]);
    return root;
  }

  private handleDoubleTapInput(): void {
    if (this.currentMinigame !== "doubleTap" || this.doubleTapEnded) {
      return;
    }

    if (this.doubleTapRound === "first") {
      this.doubleTapMinigame.registerFirstTap(this.time.now);
      this.doubleTapRound = "second";

      this.tweens.add({
        targets: this.doubleTapOrb1,
        scale: { from: 1, to: 1.12 },
        duration: 120,
        yoyo: true,
        ease: "Sine.easeOut"
      });

      this.doubleTapFuseBg?.setAlpha(1);
      this.doubleTapFuseGlow?.setAlpha(1);
      this.doubleTapFuseFill?.setAlpha(1);
      this.doubleTapFuseFill?.setScale(1, 1);

      const wMs = this.doubleTapMinigame.getWindowMs();

      this.doubleTapFuseTween?.stop();
      this.doubleTapFuseTween = this.tweens.add({
        targets: this.doubleTapFuseFill,
        scaleX: { from: 1, to: 0 },
        duration: wMs,
        ease: "Linear"
      });

      this.doubleTapOrb2Pulse?.stop();
      this.doubleTapOrb2Pulse = this.tweens.add({
        targets: this.doubleTapOrb2,
        scale: { from: 1, to: 1.06 },
        duration: 260,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1
      });

      this.doubleTapHint?.setText("NOW — second tap!");

      this.doubleTapWindowTimer?.remove(false);
      this.doubleTapWindowTimer = this.time.delayedCall(wMs, () => {
        if (this.doubleTapEnded || this.currentMinigame !== "doubleTap") {
          return;
        }
        if (this.doubleTapRound === "second") {
          this.finishDoubleTapRound(false, "timeout");
        }
      });

      return;
    }

    const outcome = this.doubleTapMinigame.evaluateSecondTap(this.time.now);
    this.doubleTapWindowTimer?.remove(false);
    this.doubleTapWindowTimer = undefined;
    this.doubleTapFuseTween?.stop();

    if (outcome === "success") {
      this.finishDoubleTapRound(true, "success");
    } else {
      this.finishDoubleTapRound(false, "late");
    }
  }

  private finishDoubleTapRound(
    success: boolean,
    reason: "success" | "timeout" | "late"
  ): void {
    if (this.doubleTapEnded || this.currentMinigame !== "doubleTap") {
      return;
    }

    this.doubleTapEnded = true;
    this.doubleTapRound = "first";

    this.doubleTapOrb2Pulse?.stop();
    this.doubleTapOrb2Pulse = undefined;
    this.doubleTapOrb2?.setScale(1);

    this.doubleTapOverlay?.disableInteractive();

    if (this.doubleTapPointerHandler && this.doubleTapOverlay) {
      this.doubleTapOverlay.off("pointerdown", this.doubleTapPointerHandler);
      this.doubleTapPointerHandler = undefined;
    }

    if (this.doubleTapSpaceHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.doubleTapSpaceHandler);
      this.doubleTapSpaceHandler = undefined;
    }

    if (success) {
      const burst = this.add
        .rectangle(
          this.scale.width / 2,
          this.scale.height / 2,
          this.scale.width,
          this.scale.height,
          0x76ff03,
          0.14
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(18);

      this.tweens.add({
        targets: burst,
        alpha: 0,
        duration: 280,
        ease: "Cubic.easeOut",
        onComplete: () => burst.destroy()
      });

      this.flashDoubleTapFeedback("PERFECT TAP!", true);
    } else {
      this.cameras.main.shake(200, 0.01);

      const shakeFlash = this.add
        .rectangle(
          this.scale.width / 2,
          this.scale.height / 2,
          this.scale.width,
          this.scale.height,
          0xd50000,
          0.16
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(18);

      this.tweens.add({
        targets: shakeFlash,
        alpha: 0,
        duration: 260,
        ease: "Cubic.easeOut",
        onComplete: () => shakeFlash.destroy()
      });

      const msg =
        reason === "timeout" ? "TOO SLOW!" : "MISSED BEAT!";
      this.flashDoubleTapFeedback(msg, false);
    }

    this.time.delayedCall(640, () => {
      this.clearDoubleTapUi();

      if (success) {
        this.handleSuccess();
        return;
      }

      this.levelManager.resetLevel();
      this.scene.start("GameOverScene");
    });
  }

  private flashDoubleTapFeedback(text: string, success: boolean): void {
    if (!this.doubleTapFeedback) {
      return;
    }

    this.doubleTapFeedbackTween?.stop();

    this.doubleTapFeedback.setText(text);
    this.doubleTapFeedback.setAlpha(0);
    this.doubleTapFeedback.setScale(0.88);

    if (success) {
      this.doubleTapFeedback.setColor("#76ff03");
      this.doubleTapFeedback.setShadow(0, 0, "#76ff03", 30, true, true);
    } else {
      this.doubleTapFeedback.setColor("#ff5252");
      this.doubleTapFeedback.setShadow(0, 0, "#ff1744", 26, true, true);
    }

    this.doubleTapFeedbackTween = this.tweens.add({
      targets: this.doubleTapFeedback,
      alpha: 1,
      scale: success ? 1.1 : 1,
      duration: 150,
      ease: "Back.easeOut",
      onComplete: () => {
        this.doubleTapFeedbackTween = this.tweens.add({
          targets: this.doubleTapFeedback,
          alpha: 0,
          duration: 240,
          ease: "Cubic.easeIn",
          delay: success ? 140 : 90
        });
      }
    });

    if (!success) {
      this.tweens.add({
        targets: this.doubleTapFeedback,
        angle: { from: -5, to: 5 },
        duration: 45,
        yoyo: true,
        repeat: 7,
        ease: "Sine.easeInOut",
        onComplete: () => this.doubleTapFeedback?.setAngle(0)
      });
    }
  }

  private clearDoubleTapUi(): void {
    this.doubleTapWindowTimer?.remove(false);
    this.doubleTapWindowTimer = undefined;

    this.doubleTapFuseTween?.stop();
    this.doubleTapFuseTween = undefined;

    this.doubleTapFeedbackTween?.stop();
    this.doubleTapFeedbackTween = undefined;

    this.doubleTapOrb2Pulse?.stop();
    this.doubleTapOrb2Pulse = undefined;

    if (this.doubleTapPointerHandler && this.doubleTapOverlay) {
      this.doubleTapOverlay.off("pointerdown", this.doubleTapPointerHandler);
    }
    this.doubleTapPointerHandler = undefined;

    if (this.doubleTapSpaceHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.doubleTapSpaceHandler);
    }
    this.doubleTapSpaceHandler = undefined;

    this.doubleTapLayers.forEach((o) => o.destroy());
    this.doubleTapLayers = [];

    if (this.doubleTapTitle) {
      this.doubleTapTitle.destroy();
      this.doubleTapTitle = undefined;
    }

    if (this.doubleTapHint) {
      this.doubleTapHint.destroy();
      this.doubleTapHint = undefined;
    }

    if (this.doubleTapOrb1) {
      this.doubleTapOrb1.destroy();
      this.doubleTapOrb1 = undefined;
    }

    if (this.doubleTapOrb2) {
      this.doubleTapOrb2.destroy();
      this.doubleTapOrb2 = undefined;
    }

    if (this.doubleTapFuseGlow) {
      this.doubleTapFuseGlow.destroy();
      this.doubleTapFuseGlow = undefined;
    }

    if (this.doubleTapFuseBg) {
      this.doubleTapFuseBg.destroy();
      this.doubleTapFuseBg = undefined;
    }

    if (this.doubleTapFuseFill) {
      this.doubleTapFuseFill.destroy();
      this.doubleTapFuseFill = undefined;
    }

    if (this.doubleTapFeedback) {
      this.doubleTapFeedback.destroy();
      this.doubleTapFeedback = undefined;
    }

    if (this.doubleTapOverlay) {
      this.doubleTapOverlay.destroy();
      this.doubleTapOverlay = undefined;
    }

    this.doubleTapRound = "first";
    this.doubleTapEnded = false;
    this.doubleTapMinigame.disarm();
  }

  private handlePenaltyShot(choice: PenaltyShotChoice, targetX: number, targetY: number): void {
    if (this.currentMinigame !== "penalty" || this.penaltyInputLocked) {
      return;
    }

    this.penaltyInputLocked = true;
    this.penaltyTargets.forEach((target) => {
      target.disableInteractive();

      const baseScale = target.getData("baseScale") as number;
      target.setScale(baseScale, baseScale);

      const glow = target.getData("glow") as Phaser.GameObjects.Arc;
      const ringOuter = target.getData("ringOuter") as Phaser.GameObjects.Arc;
      const ringInner = target.getData("ringInner") as Phaser.GameObjects.Arc;
      glow.setAlpha(0.06);
      ringOuter.setStrokeStyle(2, 0x00e5ff, 0.55);
      ringInner.setStrokeStyle(2, 0xb388ff, 0.45);
    });
    this.stopPenaltyKeeperIdle();

    const result = this.penaltyMinigame.play(choice);
    const keeperTargetX = Phaser.Math.Linear(
      this.penaltyKeeper.x,
      targetX,
      Phaser.Math.FloatBetween(0.55, 0.85)
    );
    const keeperTargetY = Phaser.Math.Linear(
      this.penaltyKeeper.y,
      targetY,
      Phaser.Math.FloatBetween(0.45, 0.75)
    );

    this.playPenaltyKick(() => {
      if (this.penaltyBall) {
        this.startPenaltyBallTrail();

        const tweenTargets: Phaser.Types.Tween.TweenBuilderConfig["targets"] = [this.penaltyBall];
        if (this.penaltyBallGlow) {
          tweenTargets.push(this.penaltyBallGlow);
        }

        this.tweens.add({
          targets: tweenTargets,
          x: targetX,
          y: targetY,
          scaleX: 0.72,
          scaleY: 0.72,
          alpha: 0.55,
          duration: 200,
          ease: "Power2",
          onComplete: () => {
            this.stopPenaltyBallTrail(true);
          }
        });
      }

      if (this.penaltyKeeper) {
        this.tweens.add({
          targets: this.penaltyKeeper,
          x: keeperTargetX,
          y: keeperTargetY,
          duration: 200,
          ease: "Back.easeOut"
        });
      }

      this.schedulePenaltyOutcome(result);
    });
  }

  private schedulePenaltyOutcome(result: "success" | "failure"): void {
    this.time.delayedCall(200, () => {
      if (this.penaltyBall) {
        const fadeTargets: Phaser.Types.Tween.TweenBuilderConfig["targets"] = [this.penaltyBall];
        if (this.penaltyBallGlow) {
          fadeTargets.push(this.penaltyBallGlow);
        }

        this.tweens.add({
          targets: fadeTargets,
          alpha: 0,
          scaleX: 0.55,
          scaleY: 0.55,
          duration: 120,
          ease: "Power2",
          onComplete: () => {
            this.penaltyBall?.destroy();
            this.penaltyBall = undefined;

            if (this.penaltyBallGlow) {
              this.penaltyBallGlow.destroy();
              this.penaltyBallGlow = undefined;
            }
          }
        });
      }

      if (this.penaltyFeedbackText) {
        this.penaltyFeedbackText.destroy();
        this.penaltyFeedbackText = undefined;
      }

      const feedback = result === "success" ? "GOAL!" : "SAVED!";
      const feedbackColor = result === "success" ? "#39ff14" : "#ff1744";
      const feedbackGlow = result === "success" ? "#39ff14" : "#ff1744";

      this.penaltyFeedbackText = this.add
        .text(this.scale.width / 2, this.scale.height / 2 - 40, feedback, {
          fontSize: "56px",
          color: feedbackColor,
          stroke: "#050816",
          strokeThickness: 10,
          fontFamily: "Segoe UI, Roboto, Arial"
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setShadow(0, 0, feedbackGlow, 28, true, true);

      this.penaltyFeedbackTween?.stop();
      this.penaltyFeedbackTween = this.tweens.add({
        targets: this.penaltyFeedbackText,
        alpha: 1,
        scale: 1.08,
        duration: 180,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.penaltyFeedbackTween = this.tweens.add({
            targets: this.penaltyFeedbackText,
            alpha: 0,
            scale: 1,
            duration: 260,
            ease: "Cubic.easeIn",
            onComplete: () => {
              this.penaltyFeedbackText?.destroy();
              this.penaltyFeedbackText = undefined;
            }
          });
        }
      });

      this.penaltyResolveTimer?.remove(false);
      this.penaltyResolveTimer = this.time.delayedCall(900, () => {
        if (result === "success") {
          this.handleSuccess();
          return;
        }

        this.levelManager.resetLevel();
        this.scene.start("GameOverScene");
      });
    });
  }

  private startPenaltyKeeperIdle(baseX: number): void {
    if (!this.penaltyKeeper) {
      return;
    }

    this.stopPenaltyKeeperIdle();

    const amplitude = Phaser.Math.Between(10, 14);
    this.penaltyKeeperIdleLeftX = baseX - amplitude;
    this.penaltyKeeperIdleRightX = baseX + amplitude;

    this.penaltyKeeper.setX(this.penaltyKeeperIdleLeftX);

    this.penaltyKeeperIdleTween = this.tweens.add({
      targets: this.penaltyKeeper,
      x: {
        from: this.penaltyKeeperIdleLeftX,
        to: this.penaltyKeeperIdleRightX
      },
      duration: Phaser.Math.Between(650, 900),
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });
  }

  private stopPenaltyKeeperIdle(): void {
    if (this.penaltyKeeperIdleTween) {
      this.penaltyKeeperIdleTween.stop();
      this.penaltyKeeperIdleTween = undefined;
    }
  }

  private clearPenaltyUi(): void {
    this.penaltyResolveTimer?.remove(false);
    this.penaltyResolveTimer = undefined;

    this.penaltyFeedbackTween?.stop();
    this.penaltyFeedbackTween = undefined;

    if (this.penaltyFeedbackText) {
      this.penaltyFeedbackText.destroy();
      this.penaltyFeedbackText = undefined;
    }

    this.clearPenaltyStadiumBackdrop();

    if (this.penaltyGoalBar) {
      this.penaltyGoalBar.destroy();
      this.penaltyGoalBar = undefined;
    }

    if (this.penaltyGoalGlow) {
      this.penaltyGoalGlow.destroy();
      this.penaltyGoalGlow = undefined;
    }

    if (this.penaltyGoalArea) {
      this.penaltyGoalArea.destroy();
      this.penaltyGoalArea = undefined;
    }

    if (this.penaltyGoalPosts) {
      this.penaltyGoalPosts.forEach((post) => post.destroy());
      this.penaltyGoalPosts = [];
    }

    this.penaltyTargets.forEach((target) => target.destroy());
    this.penaltyTargets = [];

    if (this.penaltyBall) {
      this.penaltyBall.destroy();
      this.penaltyBall = undefined;
    }

    if (this.penaltyBallGlow) {
      this.penaltyBallGlow.destroy();
      this.penaltyBallGlow = undefined;
    }

    this.stopPenaltyBallTrail(true);

    if (this.penaltyPlayer) {
      this.penaltyPlayer.destroy();
      this.penaltyPlayer = undefined;
    }

    this.penaltyKickLeg = undefined;

    if (this.penaltyKeeper) {
      this.stopPenaltyKeeperIdle();
      this.penaltyKeeper.destroy();
      this.penaltyKeeper = undefined;
    }

    this.penaltyKeeperIdleLeftX = undefined;
    this.penaltyKeeperIdleRightX = undefined;
  }

  private buildPenaltyStadiumBackdrop(width: number, height: number): void {
    this.clearPenaltyStadiumBackdrop();

    const base = this.add.rectangle(width / 2, height / 2, width, height, 0x050816, 1).setDepth(-20);
    const bandTop = this.add.rectangle(width / 2, height * 0.22, width, height * 0.55, 0x0b1b3a, 0.55).setDepth(-19);
    const bandBottom = this.add
      .rectangle(width / 2, height * 0.78, width, height * 0.35, 0x120a2b, 0.35)
      .setDepth(-19);
    const vignette = this.add.circle(width / 2, height / 2, Math.max(width, height) * 0.55, 0x000000, 0.35).setDepth(-18);

    const spotLeft = this.add
      .circle(72, 68, 110, 0x00e5ff, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-17);
    const spotRight = this.add
      .circle(width - 72, 68, 110, 0xb388ff, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-17);

    this.penaltyBackdropLayers.push(base, bandTop, bandBottom, vignette, spotLeft, spotRight);
    this.penaltySpotlights.push(spotLeft, spotRight);

    this.penaltySpotlightTweens.push(
      this.tweens.add({
        targets: spotLeft,
        alpha: { from: 0.06, to: 0.11 },
        duration: Phaser.Math.Between(900, 1300),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      }),
      this.tweens.add({
        targets: spotRight,
        alpha: { from: 0.06, to: 0.11 },
        duration: Phaser.Math.Between(900, 1300),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      })
    );
  }

  private clearPenaltyStadiumBackdrop(): void {
    this.penaltySpotlightTweens.forEach((tween) => tween.stop());
    this.penaltySpotlightTweens = [];

    this.penaltyBackdropLayers.forEach((obj) => obj.destroy());
    this.penaltyBackdropLayers = [];
    this.penaltySpotlights = [];
  }

  private startPenaltyBallTrail(): void {
    this.stopPenaltyBallTrail(false);

    let lastX = this.penaltyBall?.x ?? 0;
    let lastY = this.penaltyBall?.y ?? 0;

    this.penaltyBallTrailTimer = this.time.addEvent({
      delay: 28,
      loop: true,
      callback: () => {
        if (!this.penaltyBall) {
          return;
        }

        const x = this.penaltyBall.x;
        const y = this.penaltyBall.y;
        const dx = x - lastX;
        const dy = y - lastY;
        const speed = Math.hypot(dx, dy);
        lastX = x;
        lastY = y;
        if (speed < 0.35) {
          return;
        }

        const dot = this.add
          .circle(x, y, Phaser.Math.Between(3, 5), 0x80deea, 0.35)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setDepth(3);

        this.penaltyTrailDots.push(dot);

        this.tweens.add({
          targets: dot,
          alpha: 0,
          scale: 0.2,
          duration: 160,
          ease: "Cubic.easeOut",
          onComplete: () => {
            dot.destroy();
          }
        });
      }
    });
  }

  private stopPenaltyBallTrail(destroyDots: boolean): void {
    if (this.penaltyBallTrailTimer) {
      this.penaltyBallTrailTimer.remove(false);
      this.penaltyBallTrailTimer = undefined;
    }

    if (destroyDots) {
      this.penaltyTrailDots.forEach((dot) => dot.destroy());
      this.penaltyTrailDots = [];
    }
  }

  private createPenaltyKeeperFigure(x: number, y: number): Phaser.GameObjects.Container {
    const root = this.add.container(x, y);

    const head = this.add.circle(0, -46, 10, 0xffecb3).setStrokeStyle(3, 0x00e5ff);
    const torso = this.add.rectangle(0, -24, 26, 34, 0xf5f7ff).setStrokeStyle(3, 0xb388ff);

    const armLeft = this.add.rectangle(-22, -28, 18, 4, 0xffecb3).setAngle(-18).setStrokeStyle(2, 0x00e5ff);
    const armRight = this.add.rectangle(22, -28, 18, 4, 0xffecb3).setAngle(18).setStrokeStyle(2, 0x00e5ff);

    const legLeft = this.add.rectangle(-9, 10, 7, 22, 0x263238).setStrokeStyle(2, 0x00e5ff);
    const legRight = this.add.rectangle(9, 10, 7, 22, 0x263238).setStrokeStyle(2, 0x00e5ff);

    root.add([legLeft, legRight, torso, armLeft, armRight, head]);
    root.setSize(40, 70);

    return root;
  }

  private createPenaltyPlayerFigure(ballX: number, ballY: number): Phaser.GameObjects.Container {
    const root = this.add.container(ballX, ballY + 12);

    const aura = this.add.circle(0, -18, 34, 0xffea00, 0.06).setBlendMode(Phaser.BlendModes.ADD);

    const head = this.add.circle(0, -44, 10, 0xffecb3).setStrokeStyle(3, 0xffea00);
    const torso = this.add.rectangle(0, -22, 28, 30, 0x311b92).setStrokeStyle(3, 0xffea00);

    const armLeft = this.add.rectangle(-22, -26, 18, 4, 0xffecb3).setAngle(-12).setStrokeStyle(2, 0xb388ff);
    const armRight = this.add.rectangle(22, -26, 18, 4, 0xffecb3).setAngle(12).setStrokeStyle(2, 0xb388ff);

    const legStand = this.add.rectangle(-8, 10, 7, 22, 0x263238).setStrokeStyle(2, 0x00e5ff);
    const legKick = this.add.rectangle(10, 8, 7, 20, 0x263238).setOrigin(0.5, 0).setStrokeStyle(2, 0x00e5ff);

    root.add([aura, legStand, legKick, torso, armLeft, armRight, head]);
    root.setSize(44, 72);

    this.penaltyKickLeg = legKick;
    this.penaltyKickLegBaseRotation = legKick.rotation;
    this.penaltyKickLegBaseY = legKick.y;

    return root;
  }

  private playPenaltyKick(onKickComplete: () => void): void {
    if (!this.penaltyKickLeg) {
      onKickComplete();
      return;
    }

    this.tweens.add({
      targets: this.penaltyKickLeg,
      angle: this.penaltyKickLegBaseRotation + 42,
      y: this.penaltyKickLegBaseY - 6,
      duration: 90,
      ease: "Power2",
      yoyo: true,
      onYoyo: () => {
        onKickComplete();
      }
    });
  }
}
