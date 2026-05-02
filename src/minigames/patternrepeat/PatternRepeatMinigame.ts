/** Arrow sequence to memorize (indices 0–3 = ↑→↓←). */
export class PatternRepeatMinigame {
  private level = 1;
  private dirs: number[] = [];

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  getLength(): number {
    return Math.min(7, 3 + Math.floor((this.level - 1) / 2));
  }

  buildPattern(): number[] {
    const len = this.getLength();
    this.dirs = [];
    for (let i = 0; i < len; i++) {
      this.dirs.push(Math.floor(Math.random() * 4));
    }
    return this.dirs;
  }

  getPattern(): number[] {
    return this.dirs;
  }
}
