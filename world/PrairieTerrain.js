import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { CircularTerrainMesh } from "./CircularTerrainMesh.js";

export class PrairieTerrain {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.visible = options.visible ?? true;
    this.followCamera = options.followCamera ?? true;
    this.radius = options.radius ?? 80;
    this.subdivisions = options.subdivisions ?? 40;
    this.height = options.height ?? 0;
    this.elevation = 6;
    this.heightMapResolution = options.heightMapResolution ?? 96;
    this.hillScale = options.hillScale ?? 1;
    this.texturePath = options.texturePath ?? "textures/prairie.png";
    this.textureTiling = options.textureTiling ?? 25;

    this.ambient = options.ambient ?? [1, 1, 1];
    this.diffuse = options.diffuse ?? [1, 1, 1];
    this.specular = options.specular ?? [0.02, 0.02, 0.02];
    this.emission = options.emission ?? [0, 0, 0];
    this.shininess = options.shininess ?? 4;

    this.revision = 0;
    this.biomeMap = [];

    this.generateHeightMap();

    this.mesh = new CircularTerrainMesh(scene, {
      radius: this.radius,
      rings: this.subdivisions,
      slices: this.subdivisions * 2,
      heightSampler: this.sampleLocalHeight.bind(this),
      textureTiling: this.textureTiling,
    });

    this.appearance = new CGFappearance(scene);
    this.texture = new CGFtexture(scene, this.texturePath);
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("REPEAT", "REPEAT");
    this.updateAppearance();
  }

  generateHeightMap() {
    this.heightMap = [];
    this.biomeMap = [];

    for (let row = 0; row < this.heightMapResolution; row++) {
      const v = row / (this.heightMapResolution - 1);
      const z = v * 2 - 1;

      const heightRow = [];
      const biomeRow = [];

      for (let col = 0; col < this.heightMapResolution; col++) {
        const u = col / (this.heightMapResolution - 1);
        const x = u * 2 - 1;

        const distance = Math.hypot(x, z);
        const edgeFade = Math.max(0, 1 - Math.pow(distance, 4));

        const large = Math.sin(x * 2.0) * 0.6 + Math.cos(z * 1.7) * 0.5;
        const medium = Math.sin((x + z) * 5.0) * 0.18;
        const small = Math.sin(x * 12.0 + z * 9.0) * 0.05;

        const h = (large + medium + small) * this.elevation * edgeFade;
        heightRow.push(h);

        const dryness =
          0.5 + Math.sin(x * 3.0) * 0.25 + Math.cos(z * 4.0) * 0.25;
        biomeRow.push(Math.max(0, Math.min(1, dryness)));
      }

      this.heightMap.push(heightRow);
      this.biomeMap.push(biomeRow);
    }
  }

  updateAppearance() {
    this.appearance.setAmbient(...this.ambient, 1);
    this.appearance.setDiffuse(...this.diffuse, 1);
    this.appearance.setSpecular(...this.specular, 1);
    this.appearance.setEmission(...this.emission, 1);
    this.appearance.setShininess(this.shininess);
  }

  setSubdivisions(subdivisions) {
    this.subdivisions = Math.max(1, Math.round(subdivisions));
    this.rebuildMesh();
  }

  setRadius(radius) {
    this.radius = radius;
    this.rebuildMesh();
  }

  setHeight(height) {
    this.height = height;
    this.revision++;
  }

  setElevation(elevation) {
    this.elevation = elevation;
    this.generateHeightMap();
    this.rebuildMesh();
  }

  setHillScale(hillScale) {
    this.hillScale = hillScale;
    this.generateHeightMap();
    this.rebuildMesh();
  }

  setTexture(texturePath) {
    this.texturePath = texturePath;
    this.texture = new CGFtexture(this.scene, texturePath);
    this.appearance.setTexture(this.texture);
  }

  setTextureTiling(tiling) {
    this.textureTiling = tiling;
    this.rebuildMesh();
  }

  rebuildMesh() {
    this.mesh.updateBuffers({
      radius: this.radius,
      rings: this.subdivisions,
      slices: this.subdivisions * 2,
      heightSampler: this.sampleLocalHeight.bind(this),
      textureTiling: this.textureTiling,
    });
    this.revision++;
  }

  sampleLocalHeight(x, z) {
    const distance = Math.hypot(x, z);
    if (distance > this.radius) return 0;

    const u = (x / this.radius + 1) * 0.5;
    const v = (z / this.radius + 1) * 0.5;
    const mapX = u * (this.heightMapResolution - 1);
    const mapZ = v * (this.heightMapResolution - 1);
    const x0 = Math.floor(mapX);
    const z0 = Math.floor(mapZ);
    const x1 = Math.min(x0 + 1, this.heightMapResolution - 1);
    const z1 = Math.min(z0 + 1, this.heightMapResolution - 1);
    const tx = mapX - x0;
    const tz = mapZ - z0;

    const h00 = this.heightMap[z0][x0];
    const h10 = this.heightMap[z0][x1];
    const h01 = this.heightMap[z1][x0];
    const h11 = this.heightMap[z1][x1];
    const h0 = h00 * (1 - tx) + h10 * tx;
    const h1 = h01 * (1 - tx) + h11 * tx;

    return h0 * (1 - tz) + h1 * tz;
  }

  sampleBiome(x, z) {
    const u = (x / this.radius + 1) * 0.5;
    const v = (z / this.radius + 1) * 0.5;
    const mapX = u * (this.heightMapResolution - 1);
    const mapZ = v * (this.heightMapResolution - 1);
    const x0 = Math.floor(mapX);
    const z0 = Math.floor(mapZ);
    return this.biomeMap[z0][x0];
  }

  getHeightAt(x, z) {
    return this.height + this.sampleLocalHeight(x, z);
  }

  enableNormalViz() {
    this.mesh.enableNormalViz();
  }

  disableNormalViz() {
    this.mesh.disableNormalViz();
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
        cameraPosition[2],
      );
    }
    this.scene.translate(0, this.height, 0);
    this.mesh.display();
    this.scene.popMatrix();
  }
}
