import { CGFappearance } from "../../lib/CGF.js";
import { Disk } from "../primitives/Disk.js";

export class PrairieTerrain {
    constructor(scene, options = {}) {
        this.scene = scene;

        this.visible = options.visible ?? true;
        this.followCamera = options.followCamera ?? true;
        this.radius = options.radius ?? 80;
        this.subdivisions = options.subdivisions ?? 40;
        this.height = options.height ?? 0;
        this.ambient = options.ambient ?? [0.35, 0.45, 0.2];
        this.diffuse = options.diffuse ?? [0.45, 0.65, 0.25];
        this.specular = options.specular ?? [0.05, 0.05, 0.05];
        this.shininess = options.shininess ?? 10;

        this.disk = new Disk(scene, this.subdivisions * 2);

        this.appearance = new CGFappearance(scene);
        this.updateAppearance();
    }

    updateAppearance() {
        this.appearance.setAmbient(...this.ambient, 1);
        this.appearance.setDiffuse(...this.diffuse, 1);
        this.appearance.setSpecular(...this.specular, 1);
        this.appearance.setShininess(this.shininess);
    }

    setSubdivisions(subdivisions) {
        this.subdivisions = Math.max(1, Math.round(subdivisions));
        this.disk.updateBuffers(this.subdivisions * 2);
    }

    display() {
        if (!this.visible) return;

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
        this.scene.translate(0, this.height, 0);
        this.scene.scale(this.radius, 1, this.radius);
        this.disk.display();
        this.scene.popMatrix();
    }
}
