import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import { ObjModel } from "../../primitives/ObjModel.js";

export class Horse {
    constructor(scene, terrain = null, options = {}) {
        this.scene = scene;
        this.terrain = terrain;
        this.model = options.model ?? new ObjModel(scene, options.modelPath ?? "models/horse/horse.obj");

        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.z = options.z ?? 0;
        this.orientation = options.orientation ?? 0;
        this.scale = options.scale ?? 0.0021;
        this.hitchDistance = options.hitchDistance ?? 8.9;
        this.lateralOffset = options.lateralOffset ?? 0;
        this.groundOffset = options.groundOffset ?? 0.02;
        this.rotationOffset = options.rotationOffset ?? 0;
        this.sourceIsZUp = options.sourceIsZUp ?? true;

        this.texture = options.texture ?? new CGFtexture(scene, options.texturePath ?? "models/horse/Horse_v01.jpg");
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.16, 0.08, 0.035, 1);
        this.appearance.setDiffuse(0.72, 0.62, 0.48, 1);
        this.appearance.setSpecular(0.08, 0.07, 0.05, 1);
        this.appearance.setShininess(12);
        this.appearance.setTexture(this.texture);
        this.appearance.setTextureWrap("REPEAT", "REPEAT");
    }

    followWagon(wagon) {
        const wagonDirectionX = Math.sin(wagon.orientation);
        const wagonDirectionZ = Math.cos(wagon.orientation);
        const frontAxleZ = wagon.frontAxleZ ?? 0;
        const hitchDistanceFromFrontAxle = this.hitchDistance - frontAxleZ;
        const hitchOrientation = wagon.orientation + (wagon.steeringAngle ?? 0);

        const hitchAnchorX = wagon.x + wagonDirectionX * frontAxleZ;
        const hitchAnchorZ = wagon.z + wagonDirectionZ * frontAxleZ;
        const directionX = Math.sin(hitchOrientation);
        const directionZ = Math.cos(hitchOrientation);
        const sideX = Math.cos(hitchOrientation);
        const sideZ = -Math.sin(hitchOrientation);

        this.x = hitchAnchorX + directionX * hitchDistanceFromFrontAxle + sideX * this.lateralOffset;
        this.z = hitchAnchorZ + directionZ * hitchDistanceFromFrontAxle + sideZ * this.lateralOffset;
        this.orientation = hitchOrientation;

        if (this.terrain?.getHeightAt) {
            this.y = this.terrain.getHeightAt(this.x, this.z);
        }
    }

    display() {
        this.appearance.apply();

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + this.groundOffset, this.z);
        this.scene.rotate(this.orientation + this.rotationOffset, 0, 1, 0);
        this.scene.scale(this.scale, this.scale, this.scale);
        if (this.sourceIsZUp) {
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        }
        this.alignModelToGround();
        this.model.display();
        this.scene.popMatrix();
    }

    alignModelToGround() {
        if (!this.model.bounds) return;

        if (this.sourceIsZUp) {
            const centerX = (this.model.bounds.minX + this.model.bounds.maxX) / 2;
            const centerY = (this.model.bounds.minY + this.model.bounds.maxY) / 2;
            this.scene.translate(-centerX, -centerY, -this.model.bounds.minZ);
            return;
        }

        const [centerX, _centerY, centerZ] = this.model.getCenter();
        this.scene.translate(-centerX, -this.model.bounds.minY, -centerZ);
    }

    enableNormalViz() {
        this.model.enableNormalViz();
    }

    disableNormalViz() {
        this.model.disableNormalViz();
    }
}
