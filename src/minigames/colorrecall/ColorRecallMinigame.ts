export type RecallColor = {
  id: string;
  hex: number;
  label: string;
};

export class ColorRecallMinigame {
  readonly palette: RecallColor[] = [
    { id: "r", hex: 0xff1744, label: "RED" },
    { id: "g", hex: 0x00e676, label: "GREEN" },
    { id: "b", hex: 0x2962ff, label: "BLUE" },
    { id: "y", hex: 0xffea00, label: "YELLOW" }
  ];

  targetIndex = 0;

  resetRound(): void {
    this.targetIndex = Math.floor(Math.random() * this.palette.length);
  }

  /** Three choices including the correct color. */
  getChoices(): RecallColor[] {
    const correct = this.palette[this.targetIndex];
    const others = this.palette.filter((_, i) => i !== this.targetIndex);
    const pickTwo = others.sort(() => Math.random() - 0.5).slice(0, 2);
    const opts = [correct, ...pickTwo].sort(() => Math.random() - 0.5);
    return opts;
  }
}
