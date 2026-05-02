import Phaser from "phaser";
import { getLeaderboardSorted } from "../core/leaderboardStorage";

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super("LeaderboardScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x060a14, 1)
      .setDepth(-5);

    this.add
      .text(width / 2, height * 0.1, "Global Leaderboard", {
        fontSize: "34px",
        color: "#ffe082",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setDepth(5);

    const rows = getLeaderboardSorted();
    let y = height * 0.22;

    if (rows.length === 0) {
      this.add
        .text(width / 2, y, "Henüz kayıt yok — ilk sen ol!", {
          fontSize: "18px",
          color: "#90a4ae",
          fontFamily: "Segoe UI, Roboto, Arial"
        })
        .setOrigin(0.5);
    }

    rows.forEach((row, i) => {
      const rank = i + 1;
      const medal =
        rank === 1 ? "🥇 " : rank === 2 ? "🥈 " : rank === 3 ? "🥉 " : `${rank}. `;
      const line = `${medal}${row.name}  —  Level ${row.score}`;
      const isPodium = rank <= 3;
      this.add
        .text(width / 2, y, line, {
          fontSize: isPodium ? "22px" : "17px",
          color:
            rank === 1 ? "#fff59d" : rank === 2 ? "#eeeeee" : rank === 3 ? "#ffcc80" : "#eceff1",
          fontFamily: "Segoe UI, Roboto, Arial",
          stroke: "#050816",
          strokeThickness: isPodium ? 5 : 3
        })
        .setOrigin(0.5)
        .setScale(isPodium ? 1.02 : 1);
      y += rank <= 3 ? 36 : 30;
    });

    const btnY = height - 100;

    const bindHover = (txt: Phaser.GameObjects.Text, activeColor: string, idleColor: string) => {
      txt.on("pointerover", () => {
        txt.setColor(activeColor);
        txt.setScale(1.06);
      });
      txt.on("pointerout", () => {
        txt.setColor(idleColor);
        txt.setScale(1);
      });
    };

    const playAgain = this.add
      .text(width / 2 - 115, btnY, "Play Again", {
        fontSize: "18px",
        color: "#80deea",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const menu = this.add
      .text(width / 2 + 115, btnY, "Menu", {
        fontSize: "18px",
        color: "#cfd8dc",
        fontFamily: "Segoe UI, Roboto, Arial",
        stroke: "#050816",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    bindHover(playAgain, "#b2ebf2", "#80deea");
    bindHover(menu, "#eceff1", "#cfd8dc");

    playAgain.on("pointerup", () => {
      this.scene.start("NameEntryScene");
    });

    menu.on("pointerup", () => {
      this.registry.remove("playerName");
      this.scene.start("MainMenuScene");
    });

    this.add
      .text(width / 2, height - 34, "Bu liste bu tarayıcıda saklanır (localStorage)", {
        fontSize: "12px",
        color: "#546e7a",
        fontFamily: "Segoe UI, Roboto, Arial"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown-R", () => {
      this.scene.start("NameEntryScene");
    });
  }
}
