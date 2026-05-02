import Phaser from "phaser";
import { resolvePlayerName } from "../core/playerSession";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 40, "LoopTrial", {
        fontSize: "42px",
        color: "#ffffff",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 20, "Start", {
        fontSize: "26px",
        color: "#ffd54f",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on("pointerover", () => {
      startText.setColor("#ffe082");
      startText.setScale(1.05);
    });
    startText.on("pointerout", () => {
      startText.setColor("#ffd54f");
      startText.setScale(1);
    });

    startText.on("pointerup", () => {
      if (resolvePlayerName(this.game)) {
        this.scene.start("GameScene");
      } else {
        this.scene.start("NameEntryScene");
      }
    });
  }
}
