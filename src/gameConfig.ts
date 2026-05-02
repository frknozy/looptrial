import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { NameEntryScene } from "./scenes/NameEntryScene";
import { GameScene } from "./scenes/GameScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 960,
  height: 540,
  backgroundColor: "#10131a",
  dom: {
    createContainer: true
  },
  scene: [
    BootScene,
    MainMenuScene,
    NameEntryScene,
    GameScene,
    LeaderboardScene
  ],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  }
};
