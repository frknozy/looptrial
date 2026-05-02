import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, "Game Over - Press R to Restart", {
        fontSize: "32px",
        color: "#ff8a80"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-R", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
