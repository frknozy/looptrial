export type MinigameId =
  | "reaction"
  | "dodge"
  | "doubleTap"
  | "holdRelease"
  | "movingTarget"
  | "perfectTiming"
  | "pick"
  | "memory"
  | "findDifferent"
  | "matchPair"
  | "colorRecall"
  | "patternRepeat"
  | "smallTarget"
  | "movingDot"
  | "aimDirection"
  | "shrinkingCircle"
  | "laneSwitch"
  | "avoidRed"
  | "escapeBox"
  | "surviveThree"
  | "penalty";

export class MinigameManager {
  private readonly minigamePool: MinigameId[] = [
    "reaction",
    "dodge",
    "doubleTap",
    "holdRelease",
    "movingTarget",
    "perfectTiming",
    "pick",
    "memory",
    "findDifferent",
    "matchPair",
    "colorRecall",
    "patternRepeat",
    "smallTarget",
    "movingDot",
    "aimDirection",
    "shrinkingCircle",
    "laneSwitch",
    "avoidRed",
    "escapeBox",
    "surviveThree",
    "penalty"
  ];

  pickRandomMinigame(): MinigameId {
    const index = Math.floor(Math.random() * this.minigamePool.length);
    return this.minigamePool[index];
  }
}
