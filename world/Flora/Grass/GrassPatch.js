import { GrassBlade } from "./GrassBlade.js";

export class GrassPatch {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.blade = new GrassBlade(scene);
    this.blades = [];

    const count = 3;

    for (let i = 0; i < count; i++) {
      this.blades.push({
        rotation: (i * Math.PI) / count,
        scale: 0.8 + Math.random() * 0.4,
      });
    }
  }

  display() {
    for (const blade of this.blades) {
      this.scene.pushMatrix();

      this.scene.rotate(blade.rotation, 0, 1, 0);
      this.scene.scale(blade.scale * 3.0, blade.scale, blade.scale);
      this.blade.display();

      this.scene.popMatrix();
    }
  }
}
