import { Flower } from "./Flower.js";

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

    this.flowers = [];
    this.rebuild();
  }

  rebuild() {
    this.flowers = [];

    const pathMargin = this.wagonPath ? this.wagonPath.width / 2 + 1.5 : 0;
    const maxAttempts = this.numFlowers * 20;

    // 1. clusters por espécie
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

    // 2. flores esparsas com noise
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

    this.flowers.push({
      x,
      z,
      scale: rf(0.45, 0.85),
      rotation: Math.random() * Math.PI * 2,
      flower: new Flower(this.scene, {
        stemHeight: rf(...sp.stemH),
        petalCount: ri(...sp.petalCount),
        color,
      }),
    });
  }

  display(patchX = 0, patchZ = 0) {
    for (const e of this.flowers) {
      const worldX = patchX + e.x;
      const worldZ = patchZ + e.z;
      const y = this.terrain ? this.terrain.getHeightAt(worldX, worldZ) : 0;

      this.scene.pushMatrix();
      this.scene.translate(e.x, y, e.z);
      this.scene.rotate(e.rotation, 0, 1, 0);
      this.scene.scale(e.scale, e.scale, e.scale);
      e.flower.display();
      this.scene.popMatrix();
    }
  }
}
