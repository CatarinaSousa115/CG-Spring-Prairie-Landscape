import { CGFappearance } from "../../lib/CGF.js";
import { Sphere } from "../primitives/Sphere.js";

export class Sun {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.sectors = options.slices ?? 32;
    this.stacks = options.stacks ?? 16;
    this.orbitRadius = options.radius ?? 80;
    this.sunSize = options.sunSize ?? 8;
    this.followCamera = options.followCamera ?? false;
    this.height = options.height ?? 35;
    this.heightVariation = options.heightVariation ?? 12;

    this.geometry = new Sphere(scene, this.sectors, this.stacks, 1);
    
    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(1.0, 0.8, 0.0, 1.0);
    this.appearance.setDiffuse(1.0, 0.8, 0.0, 1.0);
    this.appearance.setSpecular(1.0, 0.9, 0.0, 1.0);
    this.appearance.setShininess(10.0);

    this.appearance.setEmission(1.0, 0.6, 0.0, 1.0);
  }

  getPosition() {
    const angle = this.scene.sunAngle ?? 0;
    const x = this.orbitRadius * Math.cos(angle);
    const y = this.height + Math.sin(angle) * this.heightVariation;
    const z = this.orbitRadius * Math.sin(angle);

    return [x, y, z];
  }

  getScenePosition() {
    const position = this.getPosition();

    if (!this.followCamera) {
      return position;
    }

    const cameraPosition = this.scene.camera.position;
    return [
      position[0] + cameraPosition[0],
      position[1] + cameraPosition[1],
      position[2] + cameraPosition[2]
    ];
  }

  display() {
    const position = this.getScenePosition();

    this.appearance.apply();
    this.scene.pushMatrix();
    this.scene.translate(position[0], position[1], position[2]);
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
