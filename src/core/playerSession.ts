import type { Game } from "phaser";

/** Oyuncu adı — registry ile senkron; sahne geçişlerinde kaybolmayı önlemek için localStorage yedeği. */
export const PLAYER_NAME_STORAGE_KEY = "looptrial_player_name";

export function persistPlayerName(game: Game, name: string): void {
  const trimmed = name.trim();
  game.registry.set("playerName", trimmed);
  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmed);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearPlayerName(game: Game): void {
  game.registry.remove("playerName");
  try {
    localStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Önce game registry; boşsa localStorage’dan okuyup registry’ye geri yazar.
 */
export function resolvePlayerName(game: Game): string | undefined {
  const reg = game.registry.get("playerName");
  if (reg !== undefined && reg !== null && String(reg).trim().length > 0) {
    return String(reg).trim();
  }
  try {
    const stored = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      const v = stored.trim();
      game.registry.set("playerName", v);
      return v;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
