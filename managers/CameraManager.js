
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
        if (!this.scene.camera) return;

        if (this.mode !== 'Manual' && this.scene.horses?.length) {
            const center = this.getHorseTeamCenter();
            if (center) {
                const { target, position } = this.camera(center);

                this.followPosition = this.lerpCameraPoint(this.followPosition, position, this.followSmoothing);
                this.followTarget = this.lerpCameraPoint(this.followTarget, target, this.followSmoothing);

                this.scene.camera.setPosition(vec3.fromValues(...this.followPosition));
                this.scene.camera.setTarget(vec3.fromValues(...this.followTarget));
            }
        }

        this.applyConstraints();
    }

    applyConstraints() {
        if (!this.scene.camera || !this.scene.skyDome) return;

        const radius = (this.scene.skyDome.radius - 1) * (this.scene.scaleFactor ?? 1);
        const pos = this.scene.camera.position;
        const dist = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
        
        let newX = pos[0];
        let newY = pos[1];
        let newZ = pos[2];
        let changed = false;

        if (dist > radius) {
            const factor = radius / dist;
            newX *= factor;
            newY *= factor;
            newZ *= factor;
            changed = true;
        }

        if (this.scene.terrain) {
            const localX = newX / (this.scene.scaleFactor ?? 1);
            const localZ = newZ / (this.scene.scaleFactor ?? 1);
            const terrainY = this.scene.terrain.getHeightAt(localX, localZ) * (this.scene.scaleFactor ?? 1);
            
            if (newY < terrainY + 1.0) {
                newY = terrainY + 1.0;
                changed = true;
            }
        }

        if (changed) {
            this.scene.camera.setPosition(vec3.fromValues(newX, newY, newZ));
            if (this.mode === 'Manual') {
                this.followPosition = [newX, newY, newZ];
            }
        }
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
