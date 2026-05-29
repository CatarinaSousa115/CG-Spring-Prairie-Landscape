export class GameStateManager {
  constructor(scene) {
    this.scene = scene;
    this.gameStatus = "playing";
    this.time = 0;
    this.startTime = undefined;
  }

  update(t) {
    if (this.gameStatus !== "playing") return;

    if (this.startTime === undefined) this.startTime = t;
    this.time = (t - this.startTime) * 0.001;

    this.checkGameStatus();
  }

  checkGameStatus() {
    if (this.scene.wagon.isDead) {
      this.endGame(false);
      return;
    }

    if (this.scene.wagon.win) {
      this.endGame(true);
      return;
    }

    const deliveredCount = this.scene.baleManager.hayBales.filter((b) => b.isDelivered).length;
    if (deliveredCount === this.scene.baleManager.hayBales.length && this.scene.baleManager.hayBales.length > 0) {
      this.endGame(true);
    }
  }

  endGame(win) {
    this.gameStatus = win ? "won" : "lost";
    if (this.scene.wagon) this.scene.wagon.win = win;
    this.scene.uiManager.showEndGame(win, this.gameTime);
  }

  restartGame() {
    this.gameStatus = "playing";
    this.startTime = undefined;
    this.time = 0;

    this.scene.wagon.hp = this.scene.wagon.maxHP;
    this.scene.wagon.isDead = false;
    this.scene.wagon.win = false;
    this.scene.wagon.x = 0;
    this.scene.wagon.z = 0;
    this.scene.wagon.speed = 0;
    this.scene.wagon.orientation = 0;
    this.scene.wagon.carriedBales = [];

    this.scene.baleManager.reset();
    this.scene.uiManager.hideOverlay();
  }

  get gameTime() {
    const mins = Math.floor(this.time / 60);
    const secs = Math.floor(this.time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  get isWon() {
    return this.gameStatus === "won";
  }
}
