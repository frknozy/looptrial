import Phaser from "phaser";
import {
  MAX_PLAYER_NAME_LENGTH,
  playerNameOrFallback
} from "../core/leaderboardStorage";
import { persistPlayerName } from "../core/playerSession";

/** Tek isim — registry’de saklanır; leaderboard ile uyumlu normalize edilir. */
export class NameEntryScene extends Phaser.Scene {
  constructor() {
    super("NameEntryScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x050816, 1)
      .setDepth(-5);

    const html = `
<div id="name-entry-root" style="font-family:Segoe UI,Roboto,sans-serif;color:#e3f2fd;text-align:center;">
  <h1 style="margin:0 0 14px;font-size:30px;color:#80deea;">Kim oynuyor?</h1>
  <p style="margin:0 auto 16px;max-width:400px;font-size:14px;line-height:1.45;opacity:0.88;">
    İsmini gir (en fazla ${MAX_PLAYER_NAME_LENGTH} karakter). Boş bırakırsan listede <strong>Oyuncu</strong> görünür.
  </p>
  <input type="text" id="playerNameInput" maxlength="${MAX_PLAYER_NAME_LENGTH}" placeholder="İsim"
    style="width:min(320px,85vw);font-size:18px;padding:12px 14px;border-radius:10px;border:2px solid #26c6da;background:#0b1420;color:#eceff1;box-sizing:border-box;" />
  <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <button type="button" id="nameStartBtn"
      style="padding:12px 28px;font-size:17px;font-weight:600;cursor:pointer;border:none;border-radius:10px;color:#050816;background:linear-gradient(120deg,#00e5ff,#7c4dff);">
      Oyuna başla
    </button>
  </div>
</div>`;

    const dom = this.add
      .dom(width / 2, height / 2)
      .createFromHTML(html)
      .setOrigin(0.5)
      .setDepth(10);

    const input = dom.node.querySelector("#playerNameInput") as HTMLInputElement | null;
    const btn = dom.node.querySelector("#nameStartBtn") as HTMLButtonElement | null;

    const start = () => {
      const raw = input?.value ?? "";
      const name = playerNameOrFallback(raw);
      persistPlayerName(this.game, name);
      dom.destroy();
      this.scene.start("GameScene");
    };

    btn?.addEventListener("click", start);
    input?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        start();
      }
    });

    this.time.delayedCall(50, () => input?.focus());
  }
}
