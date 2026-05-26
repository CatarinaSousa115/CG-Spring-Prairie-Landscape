import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { Disk } from "../primitives/Disk.js";

export class DirtPatchLayer {
  constructor(scene, terrain, options = {}) {
    this.scene = scene;
    this.terrain = terrain;
    this.wagonPath = options.wagonPath ?? null;

    this.visible = options.visible ?? true;
    this.heightOffset = options.heightOffset ?? 0.05;
    this.patchScale = options.patchScale ?? 1;
    this.disk = new Disk(scene, options.slices ?? 32);

    this.patches = this.createPatches();

    this.texture_dry = new CGFtexture(scene, "textures/dead_grass.jpg");
    this.texture_meadow = new CGFtexture(scene, "textures/grass.jpg");

    this.dryAppearance = new CGFappearance(scene);
    this.dryAppearance.setAmbient(1, 1, 1, 1);
    this.dryAppearance.setDiffuse(1, 1, 1, 1);
    this.dryAppearance.setSpecular(0.02, 0.02, 0.02, 1);
    this.dryAppearance.setShininess(3);
    this.dryAppearance.setTexture(this.texture_dry);
    this.dryAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");

    this.meadowAppearance = new CGFappearance(scene);
    this.meadowAppearance.setAmbient(1, 1, 1, 1);
    this.meadowAppearance.setDiffuse(1, 1, 1, 1);
    this.meadowAppearance.setSpecular(0.01, 0.01, 0.01, 1);
    this.meadowAppearance.setShininess(2);
    this.meadowAppearance.setTexture(this.texture_meadow);
    this.meadowAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
  }

  createPatches() {
    const rawPatches = [
      [-54, -30, 4.2, 2.3, 0.25, "dry"],
      [-47, 9, 3.8, 2.0, -0.2, "meadow"],
      [-40, 38, 4.6, 2.4, -0.55, "dry"],
      [-31, -49, 3.3, 1.8, 0.8, "meadow"],
      [-25, -14, 5.2, 2.7, 0.45, "dry"],
      [-16, 28, 4.4, 2.2, -0.4, "meadow"],
      [-8, -60, 3.8, 1.9, 0.2, "dry"],
      [2, -22, 5.6, 2.6, -0.1, "meadow"],
      [9, 44, 4.8, 2.4, 0.75, "dry"],
      [18, -39, 4.2, 2.1, 0.55, "meadow"],
      [26, 14, 3.7, 1.9, -0.7, "dry"],
      [31, 51, 4.6, 2.2, 0.15, "meadow"],
      [41, -7, 4.2, 2.0, -0.8, "dry"],
      [50, 30, 3.6, 1.8, 0.5, "meadow"],
      [58, -28, 4.0, 2.0, -0.25, "dry"],
      [-63, 23, 3.0, 1.5, 0.4, "meadow"],
      [-12, 61, 3.2, 1.7, -0.35, "dry"],
      [37, -54, 3.4, 1.8, 0.25, "meadow"],
      [64, 4, 3.0, 1.5, -0.45, "dry"],
    ];

    const blobsPerPatch = 4;

    return rawPatches.map((patch) => {
      const [x, z, sx, sz, rotation, type] = patch;
      const blobs = [];

      for (let i = 0; i < blobsPerPatch; i++) {
        blobs.push({
          ox: (Math.random() - 0.5) * 1.2,
          oz: (Math.random() - 0.5) * 1.2,
          scaleX: sx * (0.8 + Math.random() * 0.2),
          scaleZ: sz * (0.8 + Math.random() * 0.2),
          rotOffset: Math.random() * 0.5,
        });
      }

      return { x, z, sx, sz, rotation, type, blobs };
    });
  }

  getTerrainNormal(x, z) {
    const eps = 0.15;
    const hL = this.terrain.getHeightAt(x - eps, z);
    const hR = this.terrain.getHeightAt(x + eps, z);
    const hD = this.terrain.getHeightAt(x, z - eps);
    const hU = this.terrain.getHeightAt(x, z + eps);

    const nx = hL - hR;
    const ny = 2 * eps;
    const nz = hD - hU;

    const length = Math.hypot(nx, ny, nz);
    return [nx / length, ny / length, nz / length];
  }

  display() {
    if (!this.visible) return;

    this.scene.gl.enable(this.scene.gl.BLEND);
    this.scene.gl.blendFunc(
      this.scene.gl.SRC_ALPHA,
      this.scene.gl.ONE_MINUS_SRC_ALPHA,
    );
    this.scene.gl.depthMask(false);

    for (const patch of this.patches) {
      this.displayPatch(patch);
    }

    this.scene.gl.depthMask(true);
  }

  displayPatch(patch) {
    let type = patch.type;

    if (this.wagonPath && this.wagonPath.isNearPath(patch.x, patch.z, 6.0)) {
      type = "dry";
    }

    const appearance =
      type === "meadow" ? this.meadowAppearance : this.dryAppearance;
    appearance.apply();

    for (const blob of patch.blobs) {
      const finalX = patch.x + blob.ox;
      const finalZ = patch.z + blob.oz;

      const maxScale = Math.max(blob.scaleX, blob.scaleZ);
      const dynamicOffset = this.heightOffset + maxScale * 0.01;
      const y = this.terrain.getHeightAt(finalX, finalZ) + dynamicOffset;
      const [nx, ny, nz] = this.getTerrainNormal(finalX, finalZ);

      this.scene.pushMatrix();

      this.scene.translate(finalX, y, finalZ);
      const axisX = nz;
      const axisY = 0;
      const axisZ = -nx;
      const angle = Math.acos(ny);

      if (Math.abs(angle) > 0.001) {
        this.scene.rotate(angle, axisX, axisY, axisZ);
      }

      this.scene.rotate(patch.rotation + blob.rotOffset, 0, 1, 0);
      this.scene.scale(blob.scaleX, 1, blob.scaleZ);

      this.disk.display();

      this.scene.popMatrix();
    }
  }

  enableNormalViz() {
    this.disk.enableNormalViz();
  }

  disableNormalViz() {
    this.disk.disableNormalViz();
  }

  isNearDirt(x, z, margin = 1.5) {
    for (const patch of this.patches) {
      const rx = Math.max(patch.sx, patch.sz) * this.patchScale + margin;
      const dx = x - patch.x;
      const dz = z - patch.z;
      if (dx * dx + dz * dz < rx * rx) return true;
    }
    return false;
  }
}
