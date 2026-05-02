/** Simon-style pad sequence. */
export class MemorySequenceMinigame {
  private level = 1;
  private seq: number[] = [];

  configure(level: number): void {
    this.level = Math.min(10, Math.max(1, level));
  }

  readonly padCount = 4;

  getSequenceLength(): number {
    return Math.min(8, 3 + Math.floor((this.level - 1) / 2));
  }

  buildSequence(): number[] {
    const len = this.getSequenceLength();
    this.seq = [];
    for (let i = 0; i < len; i++) {
      this.seq.push(Math.floor(Math.random() * this.padCount));
    }
    return this.seq;
  }

  getSequence(): number[] {
    return this.seq;
  }
}
