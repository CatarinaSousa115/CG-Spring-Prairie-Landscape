  import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
  import { Disk } from "../primitives/Disk.js";

  export class DirtPatchLayer {
    constructor(scene, terrain, options = {}) {
      this.scene = scene;
      this.terrain = terrain;

      this.visible = options.visible ?? true;
      this.heightOffset = options.heightOffset ?? 0.08;
      this.patchScale = options.patchScale ?? 1;
      this.disk = new Disk(scene, options.slices ?? 32);

      this.patches = this.createPatches();

      this.texture_dry = new CGFtexture(scene, "textures/test.png");
      this.texture_meadow = new CGFtexture(scene, "textures/test_2.png");

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
            scaleX: sx * (0.7 + Math.random() * 0.4),
            scaleZ: sz * (0.7 + Math.random() * 0.4),
            rotOffset: Math.random() * 0.5,
          });
        }

        return { x, z, sx, sz, rotation, type, blobs };
      });
    }

    display() {
      if (!this.visible) return;

      for (const patch of this.patches) {
        this.displayPatch(patch);
      }
    }

    displayPatch(patch) {
      const appearance =
        patch.type === "meadow" ? this.meadowAppearance : this.dryAppearance;
      appearance.apply();

      for (const blob of patch.blobs) {
        const finalX = patch.x + blob.ox;
        const finalZ = patch.z + blob.oz;
        const y = this.terrain.getHeightAt(finalX, finalZ) + this.heightOffset;

        this.scene.pushMatrix();

        this.scene.translate(finalX, y, finalZ);
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
