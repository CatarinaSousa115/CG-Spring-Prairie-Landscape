import { CGFappearance } from "../../lib/CGF.js";
import { Sphere } from "../primitives/Sphere.js";

export class Sun {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.sectors = options.slices ?? 32;
    this.stacks = options.stacks ?? 16;
    this.orbitRadius = options.radius ?? 80;
    this.sunSize = options.sunSize ?? 1;
    this.followCamera = options.followCamera ?? false;

    this.geometry = new Sphere(scene, this.sectors, this.stacks, 1);
    
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

    const angle = this.scene.sunAngle ?? 0;

    const R = this.orbitRadius;

    const x = R * Math.cos(angle);
    const z = R * Math.sin(angle);
    const y = 50 + Math.sin(angle) * 10;

    this.scene.translate(x, y, z);

    this.scene.scale(this.sunSize, this.sunSize, this.sunSize);

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
