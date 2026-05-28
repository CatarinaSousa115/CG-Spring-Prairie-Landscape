export class MyUIManager {
    constructor(scene) {
        this.scene = scene;

        this.hpFill = document.getElementById("hp-fill");
        this.balesDelivered = document.getElementById("bales-delivered");
        this.timeDisplay = document.getElementById("time-display");
        this.overlay = document.getElementById("game-overlay");
        this.statusTitle = document.getElementById("status-title");
        this.statusMessage = document.getElementById("status-message");
        this.restartButton = document.getElementById("restart-button");
        this.popupContainer = document.getElementById("popup-container");
        this.notificationArea = document.getElementById("notification-area");
        this.cameraIcon = document.getElementById("camera-icon");
        this.cameraModeNumber = document.getElementById("camera-mode-number");

        if (this.restartButton) {
            this.restartButton.onclick = () => this.scene.restartGame();
        }

        if (this.cameraIcon) {
            this.cameraIcon.style.pointerEvents = "auto";
            this.cameraIcon.onclick = () => {
                if (this.scene.cameraManager) {
                    this.scene.cameraManager.nextCamera();
                }
            };
        }
    }

    updateHP(hpPercent) {
        if (this.hpFill) {
            this.hpFill.style.width = `${Math.max(0, hpPercent)}%`;
        }
    }

    updateStats(progress, time) {
        if (this.balesDelivered) this.balesDelivered.innerText = progress;
        if (this.timeDisplay) this.timeDisplay.innerText = time;
    }

    updateCameraMode(modeIndex) {
        if (this.cameraModeNumber) {
            this.cameraModeNumber.innerText = modeIndex;
        }
    }

    showEndGame(win, gameTime) {
        if (!this.overlay) return;

        this.overlay.style.display = "block";
        if (win) {
            if (this.statusTitle) {
                this.statusTitle.innerText = "YOU WIN!";
                this.statusTitle.style.color = "#00ff00";
            }
            if (this.statusMessage) {
                this.statusMessage.innerText = `Congratulations! All bales delivered in ${gameTime}.`;
            }
            if (this.restartButton) this.restartButton.innerText = "PLAY AGAIN";
        } else {
            if (this.statusTitle) {
                this.statusTitle.innerText = "GAME OVER";
                this.statusTitle.style.color = "#ff0000";
            }
            if (this.statusMessage) {
                this.statusMessage.innerText = "Your wagon was destroyed.";
            }
            if (this.restartButton) this.restartButton.innerText = "RETRY";
        }
    }

    hideOverlay() {
        if (this.overlay) this.overlay.style.display = "none";
    }

    spawnHPPopup(amount, type) {
        if (!this.popupContainer) return;

        const popup = document.createElement("div");
        popup.className = `hp-popup ${type}`;
        popup.innerText = (type === "repair" ? "+" : "-") + amount;

        popup.style.left = "50%";
        popup.style.top = "80%";

        this.popupContainer.appendChild(popup);

        setTimeout(() => popup.remove(), 1200);
    }

    showNotification(message, duration = 3000) {
        if (!this.notificationArea) return;

        const notification = document.createElement("div");
        notification.className = "notification";
        notification.innerText = message;

        this.notificationArea.appendChild(notification);

        setTimeout(() => notification.remove(), duration);
    }
}
