import { CGFappearance } from "../../../../lib/CGF.js";
import { Sphere } from "../../../primitives/Sphere.js";
import { Cylinder } from "../../../primitives/Cylinder.js";

const SPECIES = [
  { color: [0.85, 0.08, 0.08], petalCount: [4, 4], stemH: [0.5, 1.1] },
  { color: [0.92, 0.9, 0.85], petalCount: [12, 18], stemH: [0.6, 1.3] },
  { color: [0.9, 0.82, 0.08], petalCount: [5, 7], stemH: [0.4, 0.9] },
  { color: [0.55, 0.12, 0.68], petalCount: [7, 12], stemH: [0.7, 1.4] },
  { color: [0.88, 0.42, 0.62], petalCount: [6, 10], stemH: [0.5, 1.0] },
];

function ri(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function rf(a, b) {
  return a + Math.random() * (b - a);
}

function noise(x, z, sc = 0.03) {
  const ix = Math.floor(x * sc),
    iz = Math.floor(z * sc);
  const fx = x * sc - ix,
    fz = z * sc - iz;
  const h = (a, b) => {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5;
    return v - Math.floor(v);
  };
  const a = h(ix, iz),
    b = h(ix + 1, iz),
    c = h(ix, iz + 1),
    d = h(ix + 1, iz + 1);
  const ux = fx * fx * (3 - 2 * fx),
    uz = fz * fz * (3 - 2 * fz);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export class FlowerField {
  constructor(
    scene,
    numFlowers = 350,
    radius = 100,
    terrain = null,
    wagonPath = null,
    originX = 0,
    originZ = 0,
  ) {
    this.scene = scene;
    this.numFlowers = numFlowers;
    this.radius = radius;
    this.terrain = terrain;
    this.wagonPath = wagonPath;
    this.originX = originX;
    this.originZ = originZ;

    this.sphere = new Sphere(scene, 10, 6, 1);
    this.cylinder = new Cylinder(scene, 8, 1);

    this._initSharedMaterials();
    this.flowers = [];
    this.rebuild();
  }

  _initSharedMaterials() {
    this.stemAppearance = new CGFappearance(this.scene);
    this.stemAppearance.setAmbient(0.05, 0.22, 0.05, 1);
    this.stemAppearance.setDiffuse(0.12, 0.48, 0.12, 1);
    this.stemAppearance.setSpecular(0.02, 0.08, 0.02, 1);
    this.stemAppearance.setShininess(5);

    this.centerAppearance = new CGFappearance(this.scene);
    this.centerAppearance.setAmbient(0.7, 0.5, 0.02, 1);
    this.centerAppearance.setDiffuse(0.92, 0.72, 0.05, 1);
    this.centerAppearance.setSpecular(0.3, 0.25, 0.05, 1);
    this.centerAppearance.setShininess(40);

    this.petalAppearance = new CGFappearance(this.scene);
    this.petalAppearance.setSpecular(0.08, 0.08, 0.08, 1);
    this.petalAppearance.setShininess(8);

    this.petalTipAppearance = new CGFappearance(this.scene);
    this.petalTipAppearance.setSpecular(0.08, 0.08, 0.08, 1);
    this.petalTipAppearance.setShininess(8);
  }

  rebuild() {
    this.flowers = [];
    const pathMargin = this.wagonPath ? this.wagonPath.width / 2 + 1.5 : 0;
    const maxAttempts = this.numFlowers * 20;

    const clusterCount = Math.max(4, Math.floor(this.numFlowers / 12));
    const clusters = [];
    for (let i = 0; i < clusterCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * this.radius;
      clusters.push({
        cx: dist * Math.cos(angle),
        cz: dist * Math.sin(angle),
        r: rf(4, 16),
        sp: SPECIES[Math.floor(Math.random() * SPECIES.length)],
        n: ri(3, 9),
      });
    }

    for (const cl of clusters) {
      for (let i = 0; i < cl.n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.5) * cl.r;
        this._tryAdd(
          cl.cx + Math.cos(a) * r,
          cl.cz + Math.sin(a) * r,
          cl.sp,
          pathMargin,
        );
      }
    }

    let attempts = 0;
    while (this.flowers.length < this.numFlowers && attempts < maxAttempts) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * this.radius;
      const x = dist * Math.cos(angle);
      const z = dist * Math.sin(angle);
      if (noise(this.originX + x, this.originZ + z, 0.028) > 0.42) {
        this._tryAdd(
          x,
          z,
          SPECIES[Math.floor(Math.random() * SPECIES.length)],
          pathMargin,
        );
      }
    }
  }

  _tryAdd(x, z, sp, pathMargin) {
    const worldX = this.originX + x;
    const worldZ = this.originZ + z;

    if (this.wagonPath && this.wagonPath.isNearPath(worldX, worldZ, pathMargin))
      return;

    const color = sp.color.map((c) =>
      Math.max(0, Math.min(1, c + rf(-0.1, 0.1))),
    );
    const petalCount = ri(...sp.petalCount);

    const petalData = Array.from({ length: petalCount }, (_, i) => ({
      sizeMult: 0.85 + Math.random() * 0.3,
      jitter: (Math.random() - 0.5) * 0.08,
      droopAngle: 0.18 + Math.random() * 0.12,
      colorAlt: i % 2 === 0,
    }));

    this.flowers.push({
      x,
      z,
      y: this.terrain ? this.terrain.getHeightAt(worldX, worldZ) : 0,
      scale: rf(0.45, 0.85),
      rotation: Math.random() * Math.PI * 2,
      tiltAngle: (Math.random() - 0.5) * 0.18,
      baseAngle: Math.random() * Math.PI * 2,
      stemHeight: rf(...sp.stemH),
      petalCount,
      color,
      petalData,
    });
  }

  display(patchX = 0, patchZ = 0) {
    this.stemAppearance.apply();
    for (const e of this.flowers) {
      this.scene.pushMatrix();
      this.scene.translate(e.x, e.y, e.z);
      this.scene.rotate(e.rotation, 0, 1, 0);
      this.scene.scale(e.scale, e.scale, e.scale);
      this.scene.rotate(e.tiltAngle, 0, 0, 1);

      this.scene.pushMatrix();
      this.scene.rotate(-Math.PI / 2, 1, 0, 0);
      this.scene.scale(0.04, 0.04, e.stemHeight);
      this.cylinder.display();
      this.scene.popMatrix();

      this.scene.popMatrix();
    }

    this.centerAppearance.apply();
    for (const e of this.flowers) {
      this.scene.pushMatrix();
      this.scene.translate(e.x, e.y, e.z);
      this.scene.rotate(e.rotation, 0, 1, 0);
      this.scene.scale(e.scale, e.scale, e.scale);
      this.scene.rotate(e.tiltAngle, 0, 0, 1);

      this.scene.pushMatrix();
      this.scene.translate(0, e.stemHeight, 0);
      this.scene.scale(0.16, 0.1, 0.16);
      this.sphere.display();
      this.scene.popMatrix();

      this.scene.popMatrix();
    }

    const lighten = (c) => Math.min(1, c + 0.18);
    for (const e of this.flowers) {
      this.scene.pushMatrix();
      this.scene.translate(e.x, e.y, e.z);
      this.scene.rotate(e.rotation, 0, 1, 0);
      this.scene.scale(e.scale, e.scale, e.scale);
      this.scene.rotate(e.tiltAngle, 0, 0, 1);

      const [r, g, b] = e.color;
      const lr = lighten(r),
        lg = lighten(g),
        lb = lighten(b);

      for (let i = 0; i < e.petalCount; i++) {
        const pd = e.petalData[i];
        const angle =
          e.baseAngle + (i / e.petalCount) * Math.PI * 2 + pd.jitter;

        if (pd.colorAlt) {
          this.petalAppearance.setAmbient(r * 0.7, g * 0.7, b * 0.7, 1);
          this.petalAppearance.setDiffuse(r, g, b, 1);
          this.petalAppearance.apply();
        } else {
          this.petalTipAppearance.setAmbient(lr * 0.7, lg * 0.7, lb * 0.7, 1);
          this.petalTipAppearance.setDiffuse(lr, lg, lb, 1);
          this.petalTipAppearance.apply();
        }

        this.scene.pushMatrix();
        this.scene.translate(0, e.stemHeight, 0);
        this.scene.rotate(angle, 0, 1, 0);
        this.scene.rotate(pd.droopAngle, 0, 0, 1);
        this.scene.translate(0.22 * pd.sizeMult, 0, 0);
        this.scene.scale(0.28 * pd.sizeMult, 0.04, 0.12 * pd.sizeMult);
        this.sphere.display();
        this.scene.popMatrix();
      }

      this.scene.popMatrix();
    }
  }

  enableNormalViz() {
    this.sphere.enableNormalViz();
    this.cylinder.enableNormalViz();
  }

  disableNormalViz() {
    this.sphere.disableNormalViz();
    this.cylinder.disableNormalViz();
  }
}
