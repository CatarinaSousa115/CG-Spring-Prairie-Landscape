
import { CGFappearance, CGFobject } from "../../../lib/CGF.js";
import { WagonAxle } from "./WagonAxle.js";
import { WagonBed } from "./WagonBed.js";
import { WagonCover } from "./WagonCover.js";
import { WagonTongue } from "./WagonTongue.js";
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
        this.axleAppearance = this.createAppearance(this.config.materials.axleWood);
        this.bedAppearance = this.createAppearance(this.config.materials.bedWood);
        this.bedSeamAppearance = this.createAppearance(this.config.materials.bedSeams);
        this.tongueAppearance = this.createAppearance(this.config.materials.tongueWood);
        this.coverAppearance = this.createAppearance(this.config.materials.coverCanvas);
        this.coverFrameAppearance = this.createAppearance(this.config.materials.coverFrameWood);

        this.bed = components.bed ?? new WagonBed(scene, this.config.bed);
        this.cover = components.cover ?? new WagonCover(scene, this.config.cover);
        this.frontAxle = components.frontAxle ?? new WagonAxle(scene);
        this.rearAxle = components.rearAxle ?? new WagonAxle(scene);
        this.tongue = components.tongue ?? new WagonTongue(scene, this.config.tongue);
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
        this.bedAppearance.apply();
        this.bed.display(null, this.bedSeamAppearance);
        this.scene.popMatrix();
    }

    displayCover() {
        if (!this.cover) return;

        const cover = this.config.cover;

        this.scene.pushMatrix();
        this.scene.translate(
            0,
            this.groundClearance + this.bodyHeight + cover.yOffset,
            cover.zOffset
        );
        this.scene.scale(
            this.bodyWidth * cover.widthRatio,
            cover.height,
            this.bodyLength * cover.lengthRatio
        );
        this.cover.display(this.coverAppearance, this.coverFrameAppearance);

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
        this.axleAppearance.apply();
        axle.display();
        this.scene.popMatrix();
    }

    displayTongue() {
        if (!this.tongue) return;

        const tongue = this.config.tongue;

        this.scene.pushMatrix();
        this.scene.translate(0, tongue.yOffset, tongue.zOffset);
        this.tongueAppearance.apply();
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
