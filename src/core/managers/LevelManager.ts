export class LevelManager {
  private currentLevel: number;
  private readonly maxLevel: number;

  constructor(initialLevel = 1, maxLevel = 10) {
    this.currentLevel = initialLevel;
    this.maxLevel = maxLevel;
  }

  getLevel(): number {
    return this.currentLevel;
  }

  getMaxLevel(): number {
    return this.maxLevel;
  }

  nextLevel(): number {
    this.currentLevel += 1;
    return this.currentLevel;
  }

  resetLevel(): number {
    this.currentLevel = 1;
    return this.currentLevel;
  }
}
