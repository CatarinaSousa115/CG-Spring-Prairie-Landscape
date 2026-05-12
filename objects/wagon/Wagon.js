
import { CGFappearance, CGFobject } from "../../../lib/CGF.js";
import { WagonWheel } from "./WagonWheel.js";
import { mergeWagonConfig } from "./WagonConfig.js";

// Coordena movimento e posicionamento das peças do wagon.
export class Wagon extends CGFobject {
    constructor(scene, terrain = null, config = {}, components = {}) {
        super(scene);

        this.terrain = terrain;
        this.config = mergeWagonConfig(config);
        this.parts = this.config.visibleParts;

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.orientation = 0;

        this.speed = 0;
        this.steeringAngle = 0;

        this.wheelRotation = 0;

        const { dimensions, layout, wheel } = this.config;

        this.bodyLength = dimensions.bodyLength;
        this.bodyWidth = dimensions.bodyWidth;
        this.bodyHeight = dimensions.bodyHeight;
        this.groundClearance = dimensions.groundClearance;

        this.frontAxleZ = layout.frontAxleZ;
        this.rearAxleZ = layout.rearAxleZ;
        this.wheelX = this.bodyWidth / 2 + layout.wheelSideOffset;
        this.wheelRadius = wheel.radius;
        this.wheelY = this.wheelRadius;

        this.wheels = {
            frontLeft: new WagonWheel(scene, wheel),
            frontRight: new WagonWheel(scene, wheel),
            rearLeft: new WagonWheel(scene, wheel),
            rearRight: new WagonWheel(scene, wheel)
        };
        this.wheelAppearance = this.createAppearance(this.config.materials.wheelWood);

        this.bed = components.bed ?? null;
        this.cover = components.cover ?? null;
        this.frontAxle = components.frontAxle ?? null;
        this.rearAxle = components.rearAxle ?? null;
        this.tongue = components.tongue ?? null;
    }

    update(t) {
        this.updateMovement();
        this.updatePositionOnTerrain();
    }

    updateMovement() {
        const movement = this.config.movement;

        if (this.scene.gui?.isKeyPressed?.("KeyW")) {
            this.speed += movement.acceleration;
        }

        if (this.scene.gui?.isKeyPressed?.("KeyS")) {
            this.speed -= movement.brake;
        }

        if (this.scene.gui?.isKeyPressed?.("KeyA")) {
            this.steeringAngle += movement.steeringSpeed;
        } else if (this.scene.gui?.isKeyPressed?.("KeyD")) {
            this.steeringAngle -= movement.steeringSpeed;
        } else {
            this.steeringAngle *= movement.steeringReturn;
        }

        this.speed = Math.max(0, Math.min(this.speed, movement.maxSpeed));
        this.steeringAngle = Math.max(
            -movement.maxSteeringAngle,
            Math.min(this.steeringAngle, movement.maxSteeringAngle)
        );

        if (this.speed > 0) {
            this.orientation += this.steeringAngle * this.speed * 0.08;

            this.x += Math.sin(this.orientation) * this.speed;
            this.z += Math.cos(this.orientation) * this.speed;

            this.wheelRotation += this.speed / this.wheelRadius;
        }

        this.speed = Math.max(0, this.speed - movement.friction);
    }

    updatePositionOnTerrain() {
        if (this.terrain?.getHeightAt) {
            this.y = this.terrain.getHeightAt(this.x, this.z);
        }
    }

    display() {
        this.scene.pushMatrix();

        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(this.orientation, 0, 1, 0);

        if (this.parts.bed) this.displayBed();
        if (this.parts.cover) this.displayCover();

        this.displayRearAssembly();
        this.displayFrontAssembly();

        this.scene.popMatrix();
    }

    displayBed() {
        if (!this.bed) return;

        this.scene.pushMatrix();
        this.scene.translate(0, this.groundClearance + this.bodyHeight / 2, 0);
        this.scene.scale(this.bodyWidth, this.bodyHeight, this.bodyLength);
        this.bed.display();
        this.scene.popMatrix();
    }

    displayCover() {
        if (!this.cover) return;

        this.scene.pushMatrix();
        this.scene.translate(0, this.groundClearance + this.bodyHeight + 0.55, -0.55);
        this.scene.scale(this.bodyWidth * 0.95, 1.05, this.bodyLength * 0.48);
        this.cover.display();

        this.scene.popMatrix();
    }

    displayRearAssembly() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.wheelY, this.rearAxleZ);

        if (this.parts.axles) this.displayAxle(this.rearAxle);
        if (this.parts.wheels) {
            this.displayWheel(-this.wheelX, 0, 0, this.wheels.rearLeft, true);
            this.displayWheel(this.wheelX, 0, 0, this.wheels.rearRight, false);
        }

        this.scene.popMatrix();
    }

    displayFrontAssembly() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.wheelY, this.frontAxleZ);

        this.scene.rotate(this.steeringAngle, 0, 1, 0);

        if (this.parts.axles) this.displayAxle(this.frontAxle);
        if (this.parts.tongue) this.displayTongue();
        if (this.parts.wheels) {
            this.displayWheel(-this.wheelX, 0, 0, this.wheels.frontLeft, true);
            this.displayWheel(this.wheelX, 0, 0, this.wheels.frontRight, false);
        }

        this.scene.popMatrix();
    }

    displayAxle(axle) {
        if (!axle) return;

        this.scene.pushMatrix();
        this.scene.scale(this.bodyWidth + 0.85, 0.08, 0.08);
        axle.display();
        this.scene.popMatrix();
    }

    displayTongue() {
        if (!this.tongue) return;

        this.scene.pushMatrix();
        this.scene.translate(0, -0.05, 1.4);
        this.scene.scale(0.12, 0.12, 2.4);
        this.tongue.display();

        this.scene.popMatrix();
    }

    displayWheel(x, y, z, wheel, leftSide) {
        this.scene.pushMatrix();

        this.scene.translate(x, y, z);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);

        if (leftSide) {
            this.scene.rotate(Math.PI, 0, 1, 0);
        }

        this.scene.rotate(-this.wheelRotation, 0, 0, 1);
        this.scene.scale(this.wheelRadius, this.wheelRadius, this.wheelRadius);

        this.wheelAppearance.apply();
        wheel.display();

        this.scene.popMatrix();
    }

    createAppearance(material) {
        const appearance = new CGFappearance(this.scene);

        appearance.setAmbient(...material.ambient, 1);
        appearance.setDiffuse(...material.diffuse, 1);
        appearance.setSpecular(...material.specular, 1);
        appearance.setShininess(material.shininess);

        return appearance;
    }
}
