
export class MyCameraManager {
    constructor(scene) {
        this.scene = scene;

        this.followDistance = 50;
        this.followHeight = 15;
        this.followLookAhead = 3.6;
        this.followSmoothing = 0.16;

        this.followPosition = null;
        this.followTarget = null;
        this.mode = 'ThirdPerson';
        this.modes = ['ThirdPerson', 'FirstPerson', 'TopDown', 'Manual'];

        if (this.scene.uiManager) {
            this.scene.uiManager.updateCameraMode(1);
        }
    }

    nextCamera() {
        const currentIndex = this.modes.indexOf(this.mode);
        const nextIndex = (currentIndex + 1) % this.modes.length;
        this.mode = this.modes[nextIndex];

        if (this.mode === 'Manual') {
            this.manualMode();
        }
        
        if (this.scene.uiManager) {
            this.scene.uiManager.updateCameraMode(nextIndex + 1);
        }
    }

    manualMode() {
        this.scene.camera.setPosition(vec3.fromValues(45, 28, 45));
        this.scene.camera.setTarget(vec3.fromValues(0, 0, 0));
        this.followPosition = [45, 28, 45];
        this.followTarget = [0, 0, 0];

        if (this.scene.uiManager) {
            this.scene.uiManager.showNotification("Manual camera control enabled. Use the mouse to move.");
        }
    }

    update() {
        if (this.mode === 'Manual' || !this.scene.horses?.length || !this.scene.camera) return;

        const center = this.getHorseTeamCenter();
        if (!center) return;

        const { target, position } = this.camera(center);

        this.followPosition = this.lerpCameraPoint(this.followPosition, position, this.followSmoothing);
        this.followTarget = this.lerpCameraPoint(this.followTarget, target, this.followSmoothing);

        this.scene.camera.setPosition(vec3.fromValues(...this.followPosition));
        this.scene.camera.setTarget(vec3.fromValues(...this.followTarget));
    }

    camera(center) {
        switch (this.mode) {
            case 'TopDown':
                return this.topDown(center);
            case 'FirstPerson':
                return this.firstPerson(center);
            default: // ThirdPerson
                return this.thirdPerson(center);
        }
    }

    topDown(center) {
        const scale = this.scene.scaleFactor ?? 1;
        const skyHeight = this.scene.skyHeight ?? 200;
        const distanceToSky = Math.max(20, skyHeight - center.y);

        return {
            target: [center.x * scale, 0, center.z * scale],
            position: [
                center.x * scale,
                distanceToSky * 0.5 * scale,
                center.z * scale - distanceToSky * 0.25,
            ]
        };
    }

    firstPerson(center) {
        const scale = this.scene.scaleFactor ?? 1;
        const orientation = this.scene.wagon?.orientation ?? this.scene.horses[0].orientation ?? 0;
        const directionX = Math.sin(orientation);
        const directionZ = Math.cos(orientation);

        return {
            target: [
                (center.x + directionX * 10) * scale,
                (center.y + 2.0) * scale,
                (center.z + directionZ * 10) * scale,
            ],
            position: [
                (center.x + directionX * 1.5) * scale,
                (center.y + 3.8) * scale,
                (center.z + directionZ * 1.5) * scale,
            ]
        };
    }

    thirdPerson(center) {
        const scale = this.scene.scaleFactor ?? 1;
        const orientation = this.scene.wagon?.orientation ?? this.scene.horses[0].orientation ?? 0;
        const directionX = Math.sin(orientation);
        const directionZ = Math.cos(orientation);

        return {
            target: [
                (center.x + directionX * this.followLookAhead) * scale,
                (center.y + 1.8) * scale,
                (center.z + directionZ * this.followLookAhead) * scale,
            ],
            position: [
                (center.x - directionX * this.followDistance) * scale,
                (center.y + this.followHeight) * scale,
                (center.z - directionZ * this.followDistance) * scale,
            ]
        };
    }

    getHorseTeamCenter() {
        if (!this.scene.horses?.length) return null;

        let x = 0;
        let y = 0;
        let z = 0;
        for (const horse of this.scene.horses) {
            x += horse.x;
            y += horse.y;
            z += horse.z;
        }

        return {
            x: x / this.scene.horses.length,
            y: y / this.scene.horses.length,
            z: z / this.scene.horses.length,
        };
    }

    lerpCameraPoint(current, target, amount) {
        if (!current) return [...target];
        return [
            current[0] + (target[0] - current[0]) * amount,
            current[1] + (target[1] - current[1]) * amount,
            current[2] + (target[2] - current[2]) * amount,
        ];
    }
}
