import { GrassPatch } from "./GrassPatch.js";

export class GrassField {
  constructor(scene, terrain, options = {}) {
    this.scene = scene;
    this.terrain = terrain;

    this.patches = [];

    this.generate();
  }

  generate() {
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 140;

      const biome = this.terrain.sampleBiome(x, z);

      const density = biome > 0.6 ? 18 : 40;

      this.patches.push({
        x,
        z,
        scale: 0.8 + Math.random(),
        patch: new GrassPatch(this.scene, {
          count: density,
        }),
      });
    }
  }

  display() {
    for (const entry of this.patches) {
      const y = this.terrain.getHeightAt(entry.x, entry.z);

      this.scene.pushMatrix();

      this.scene.translate(entry.x, y, entry.z);
      this.scene.scale(entry.scale, entry.scale, entry.scale);

      entry.patch.display();

      this.scene.popMatrix();
    }
  }
}
