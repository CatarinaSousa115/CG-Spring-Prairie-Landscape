import { CGFappearance } from "../../lib/CGF.js";
import { Sphere } from "../primitives/Sphere.js";

export class Sun {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.sectors = options.slices ?? 32;
    this.stacks = options.stacks ?? 16;
    this.radius = options.radius ?? 100;
    this.followCamera = options.followCamera ?? false;

    this.geometry = new Sphere(scene, this.sectors, this.stacks, this.radius);

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(1.0, 0.8, 0.0, 1.0);
    this.appearance.setDiffuse(1.0, 0.8, 0.0, 1.0);
    this.appearance.setSpecular(1.0, 0.9, 0.0, 1.0);
    this.appearance.setShininess(10.0);

    this.appearance.setEmission(1.0, 0.6, 0.0, 1.0);
  }

  display() {

    this.appearance.apply();
    this.scene.pushMatrix();

    if (this.followCamera) {
      const cameraPosition = this.scene.camera.position;
      this.scene.translate(
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
      );
    }

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
