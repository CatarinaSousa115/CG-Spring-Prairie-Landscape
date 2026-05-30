import { CGFappearance } from "../../lib/CGF.js";
import { SemiSphere } from "../primitives/SemiSphere.js";

export class SkyDome {
    constructor(scene, options = {}) {
        this.scene = scene;

        this.radius = options.radius ?? 80;
        this.slices = options.slices ?? 32;
        this.stacks = options.stacks ?? 16;
        this.followCamera = options.followCamera ?? true;

        this.geometry = new SemiSphere(scene, this.slices, this.stacks, 1);

        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0, 0, 0, 1);
        this.appearance.setDiffuse(0, 0, 0, 1);
        this.appearance.setEmission(0.67, 0.875, 1.0, 1);
        this.appearance.setSpecular(0, 0, 0, 1);
        this.appearance.setShininess(1);
    }

    display() {
        this.appearance.apply();

        this.scene.pushMatrix();
        if (this.followCamera) {
            const cameraPosition = this.scene.camera.position;
            this.scene.translate(
                cameraPosition[0],
                cameraPosition[1],
                cameraPosition[2]
            );
        }
        this.scene.scale(this.radius, this.radius, this.radius);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.geometry.display();
        this.scene.popMatrix();
    }

    enableNormalViz() {
        this.geometry.enableNormalViz();
    }

    disableNormalViz() {
        this.geometry.disableNormalViz();
    }
}
