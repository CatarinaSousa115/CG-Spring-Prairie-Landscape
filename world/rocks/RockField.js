import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import { PerturbedRock } from "./PerturbedRock.js";

export class RockField {
  constructor(scene, terrain, options = {}) {
    this.scene = scene;
    this.terrain = terrain;

    this.visible = options.visible ?? true;
    this.heightOffset = options.heightOffset ?? 0.65;
    this.rockScale = options.rockScale ?? 1;
    this.rocks = this.createRocks();
    this.geometries = this.rocks.map(
      (rock, index) =>
        new PerturbedRock(scene, {
          seed: 100 + index * 17,
          sectors: rock[7],
          stacks: Math.max(6, Math.round(rock[7] * 0.55)),
          roughness: rock[8],
        }),
    );

    this.appearances = this.createAppearances();
  }

  createAppearances() {

    const textures = 
    [
        new CGFtexture(this.scene,"textures/rock.jpg"),
        new CGFtexture(this.scene,"textures/rock_2.jpg"),
        new CGFtexture(this.scene,"textures/rock_3.jpg")
    ];

    const materials = [
      {ambient: [1, 1, 1], diffuse: [1, 1, 1], specular: [0.08, 0.08, 0.07] },
      {ambient: [1, 1, 1],diffuse: [0.85, 0.85, 0.85],specular: [0.07, 0.08, 0.08]},
      {ambient: [1, 1, 1],diffuse: [1, 0.9, 0.8],specular: [0.08, 0.06, 0.04]},
    ];

    return materials.map((material,i) => {
      const appearance = new CGFappearance(this.scene);
      appearance.setAmbient(...material.ambient, 1);
      appearance.setDiffuse(...material.diffuse, 1);
      appearance.setSpecular(...material.specular, 1);
      appearance.setShininess(12);
      appearance.setTexture(textures[i]);
      appearance.setTextureWrap("REPEAT", "REPEAT");
      return appearance;
    });
  }

  createRocks() {
    return [
      [-12, -8, 4.5, 2.0, 3.8, 0.2, 0, 14, 0.28],
      [7, 12, 1.2, 0.6, 1.0, -0.5, 1, 12, 0.25],
      [15, -6, 0.7, 0.4, 0.6, 0.9, 2, 10, 0.23],
      [-22, 18, 3.2, 1.5, 2.8, -0.15, 0, 12, 0.27],
      [-58, -58, 5.0, 2.5, 4.2, 0.35, 0, 14, 0.28],
      [-52, 52, 1.0, 0.5, 0.9, -0.2, 1, 12, 0.22],
      [-38, -9, 2.8, 1.3, 2.4, 0.8, 2, 14, 0.26],
      [-26, 39, 0.8, 0.5, 0.7, -0.6, 0, 10, 0.24],
      [-14, -54, 3.8, 1.8, 3.2, 1.2, 1, 12, 0.3],
      [4, 59, 1.5, 0.8, 1.4, 0.15, 2, 14, 0.25],
      [18, -17, 0.6, 0.3, 0.5, -0.75, 0, 10, 0.24],
      [31, -48, 4.8, 2.2, 4.0, 0.45, 1, 14, 0.31],
      [39, 19, 2.0, 1.0, 1.8, -1.1, 2, 12, 0.27],
      [56, -5, 0.9, 0.5, 0.8, 0.7, 0, 10, 0.23],
      [62, 45, 3.5, 1.6, 3.0, -0.35, 1, 14, 0.29],
    ];
  }

  display() {
    if (!this.visible) return;
    for (let i = 0; i < this.rocks.length; i++) {
      this.displayRock(this.rocks[i], this.geometries[i]);
    }
  }

  displayRock(rock, geometry) {
    const [x, z, sx, sy, sz, rotation, materialIndex] = rock;
    const y =
      this.terrain.getHeightAt(x, z) + this.heightOffset * sy * this.rockScale;

    this.appearances[materialIndex].apply();

    this.scene.pushMatrix();
    this.scene.translate(x, y, z);
    this.scene.rotate(rotation, 0, 1, 0);
    this.scene.scale(
      sx * this.rockScale,
      sy * this.rockScale,
      sz * this.rockScale,
    );
    geometry.display();
    this.scene.popMatrix();
  }

  getCollisionObjects() {
    return this.rocks.map((rock) => {
      const [x, z, sx, , sz] = rock;
      return { x, z, radius: Math.max(sx, sz) * this.rockScale };
    });
  }

  enableNormalViz() {
    for (const geometry of this.geometries) geometry.enableNormalViz();
  }

  disableNormalViz() {
    for (const geometry of this.geometries) geometry.disableNormalViz();
  }

  isNearRock(x, z, margin = 2.0) {
    for (const rock of this.rocks) {
      const [rx, rz, sx, , sz] = rock;
      const radius = Math.max(sx, sz) * this.rockScale + margin;
      const dx = x - rx;
      const dz = z - rz;
      if (dx * dx + dz * dz < radius * radius) return true;
    }
    return false;
  }
}
