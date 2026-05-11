import { GrassBlade } from "./GrassBlade.js";
import { CGFappearance } from "../../../../lib/CGF.js";

export class GrassPatch {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.blade = new GrassBlade(scene);

    this.blades = [];

    const count = options.count ?? 40;

    for (let i = 0; i < count; i++) {
      this.blades.push({
        x: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.8,
      });
    }

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.2, 0.5, 0.1, 1);
    this.appearance.setDiffuse(0.3, 0.7, 0.2, 1);
  }

  display() {
    this.appearance.apply();

    for (const blade of this.blades) {
      this.scene.pushMatrix();

      this.scene.translate(blade.x, 0, blade.z);
      this.scene.rotate(blade.rotation, 0, 1, 0);
      this.scene.scale(blade.scale, blade.scale, blade.scale);

      this.blade.display();

      this.scene.popMatrix();
    }
  }
}
