export type PenaltyShotChoice =
  | "topLeft"
  | "topRight"
  | "center"
  | "bottomLeft"
  | "bottomRight";

export type PenaltyPlayResult = "success" | "failure";

export class PenaltyMinigame {
  private readonly shotOptions: PenaltyShotChoice[] = [
    "topLeft",
    "topRight",
    "center",
    "bottomLeft",
    "bottomRight"
  ];

  private readonly keeperMissChance = 0.33;

  getOptions(): PenaltyShotChoice[] {
    return [...this.shotOptions];
  }

  play(choice: PenaltyShotChoice): PenaltyPlayResult {
    if (!this.shotOptions.includes(choice)) {
      throw new Error("Invalid penalty shot choice");
    }

    const keeperMisses = Math.random() < this.keeperMissChance;
    return keeperMisses ? "success" : "failure";
  }
}
