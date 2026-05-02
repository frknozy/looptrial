export type LeaderboardEntry = { name: string; score: number };

const STORAGE_KEY = "looptrial_leaderboard";

export const MAX_PLAYER_NAME_LENGTH = 14;

/** Trim + max uzunluk; boş string dönebilir. */
export function normalizePlayerName(raw: string): string {
  return raw.trim().slice(0, MAX_PLAYER_NAME_LENGTH);
}

/** İsim boşsa güvenli varsayılan. */
export function playerNameOrFallback(raw: string): string {
  const n = normalizePlayerName(raw);
  return n || "Oyuncu";
}

function sanitizeScore(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.max(0, Math.floor(n));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const out: LeaderboardEntry[] = [];
    for (const x of parsed) {
      if (typeof x !== "object" || x === null) {
        continue;
      }
      const o = x as Record<string, unknown>;
      if (typeof o.name !== "string") {
        continue;
      }
      const name = normalizePlayerName(o.name);
      if (!name) {
        continue;
      }
      const score = sanitizeScore(o.score);
      out.push({ name, score });
    }
    return out;
  } catch {
    return [];
  }
}

/** Aynı isim (büyük/küçük harf yok sayılır) tek satırda en yüksek skor kalır. */
export function upsertLeaderboardEntry(name: string, score: number): void {
  const normalized = normalizePlayerName(name);
  const displayName = normalized || "Oyuncu";
  const safeScore = sanitizeScore(score);

  const list = loadLeaderboard();
  const lower = displayName.toLowerCase();
  const idx = list.findIndex((e) => e.name.toLowerCase() === lower);
  if (idx >= 0) {
    if (safeScore > list[idx].score) {
      list[idx] = { name: displayName, score: safeScore };
    }
  } else {
    list.push({ name: displayName, score: safeScore });
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota / private mode — sessizce yok say */
  }
}

/** Skor büyükten küçüğe; eşitlikte isim. */
export function getLeaderboardSorted(): LeaderboardEntry[] {
  return [...loadLeaderboard()].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name, "tr");
  });
}
