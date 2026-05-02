import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 40, "LoopTrial", {
        fontSize: "42px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 20, "Start", {
        fontSize: "24px",
        color: "#ffd54f"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on("pointerup", () => {
      this.scene.start("GameScene");
    });
  }
}
