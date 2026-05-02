import Phaser from "phaser";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, "Victory! You finished all levels", {
        fontSize: "32px",
        color: "#c5e1a5"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-R", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
