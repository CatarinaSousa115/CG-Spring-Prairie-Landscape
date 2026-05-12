import { Flower } from "./Flower.js";

export class FlowerField {
  constructor(scene, terrain, options = {}) {
    this.scene = scene;
    this.terrain = terrain;

    this.count = options.count ?? 300;

    this.flowers = [];

    this.generateFlowers();
  }

  generateFlowers() {
    const colors = [
      [1, 0.2, 0.2],
      [1, 1, 0.2],
      [1, 0.5, 1],
      [1, 0.7, 0.8],
    ];

    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 140;

      const biome = this.terrain.sampleBiome(x, z);

      if (biome > 0.7) continue;

      this.flowers.push({
        x,
        z,
        scale: 0.6 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        flower: new Flower(this.scene, {
          stemHeight: 1.2 + Math.random(),
          petalCount: 5 + Math.floor(Math.random() * 4),
          color: colors[Math.floor(Math.random() * colors.length)],
        }),
      });
    }
  }

  display() {
    for (const entry of this.flowers) {
      const y = this.terrain.getHeightAt(entry.x, entry.z);

      this.scene.pushMatrix();

      this.scene.translate(entry.x, y, entry.z);
      this.scene.rotate(entry.rotation, 0, 1, 0);
      this.scene.scale(entry.scale, entry.scale, entry.scale);

      entry.flower.display();

      this.scene.popMatrix();
    }
  }
}
