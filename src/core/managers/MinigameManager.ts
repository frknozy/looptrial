export type MinigameId =
  | "reaction"
  | "dodge"
  | "doubleTap"
  | "pick"
  | "memory"
  | "penalty";

export class MinigameManager {
  private readonly minigamePool: MinigameId[] = [
    "reaction",
    "dodge",
    "doubleTap",
    "pick",
    "memory",
    "penalty"
  ];

  pickRandomMinigame(): MinigameId {
    const index = Math.floor(Math.random() * this.minigamePool.length);
    return this.minigamePool[index];
  }
}
