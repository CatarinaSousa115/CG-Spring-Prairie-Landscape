import { CGFobject } from "../../lib/CGF.js";

export class CircularTerrainMesh extends CGFobject {
  constructor(scene, options = {}) {
    super(scene);

    this.radius = options.radius ?? 80;
    this.rings = Math.max(1, Math.round(options.rings ?? 40));
    this.slices = Math.max(8, Math.round(options.slices ?? this.rings * 2));
    this.heightSampler = options.heightSampler ?? (() => 0);
    this.textureTiling = options.textureTiling ?? 1;

    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    this.buildVertices();
    this.buildIndices();
    this.normals = this.computeVertexNormals();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  buildVertices() {
    const t = this.textureTiling;

    // Center vertex — UV at the center of the tiling grid
    this.vertices.push(0, this.heightSampler(0, 0), 0);
    this.texCoords.push(0.5 * t, 0.5 * t);

    for (let ring = 1; ring <= this.rings; ring++) {
      const ringRadius = (ring / this.rings) * this.radius;

      for (let slice = 0; slice < this.slices; slice++) {
        const angle = (2 * Math.PI * slice) / this.slices;
        const x = ringRadius * Math.cos(angle);
        const z = ringRadius * Math.sin(angle);
        const y = this.heightSampler(x, z);

        this.vertices.push(x, y, z);

        // Normalise x,z to [-1,1] then to [0,1], then scale by tiling
        const u = ((x / this.radius) * 0.5 + 0.5) * t;
        const v = ((z / this.radius) * 0.5 + 0.5) * t;
        this.texCoords.push(u, v);
      }
    }
  }

  buildIndices() {
    for (let slice = 0; slice < this.slices; slice++) {
      const current = 1 + slice;
      const next = 1 + ((slice + 1) % this.slices);

      this.indices.push(0, next, current);
    }

    for (let ring = 2; ring <= this.rings; ring++) {
      const innerStart = 1 + (ring - 2) * this.slices;
      const outerStart = 1 + (ring - 1) * this.slices;

      for (let slice = 0; slice < this.slices; slice++) {
        const next = (slice + 1) % this.slices;

        const innerCurrent = innerStart + slice;
        const innerNext = innerStart + next;
        const outerCurrent = outerStart + slice;
        const outerNext = outerStart + next;

        this.indices.push(innerCurrent, outerNext, outerCurrent);
        this.indices.push(innerCurrent, innerNext, outerNext);
      }
    }
  }

  computeVertexNormals() {
    const normals = new Array(this.vertices.length).fill(0);

    for (let i = 0; i < this.indices.length; i += 3) {
      const a = this.indices[i] * 3;
      const b = this.indices[i + 1] * 3;
      const c = this.indices[i + 2] * 3;

      const ax = this.vertices[a];
      const ay = this.vertices[a + 1];
      const az = this.vertices[a + 2];
      const bx = this.vertices[b];
      const by = this.vertices[b + 1];
      const bz = this.vertices[b + 2];
      const cx = this.vertices[c];
      const cy = this.vertices[c + 1];
      const cz = this.vertices[c + 2];

      const ux = bx - ax;
      const uy = by - ay;
      const uz = bz - az;
      const vx = cx - ax;
      const vy = cy - ay;
      const vz = cz - az;

      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;

      normals[a] += nx;
      normals[a + 1] += ny;
      normals[a + 2] += nz;
      normals[b] += nx;
      normals[b + 1] += ny;
      normals[b + 2] += nz;
      normals[c] += nx;
      normals[c + 1] += ny;
      normals[c + 2] += nz;
    }

    for (let i = 0; i < normals.length; i += 3) {
      const nx = normals[i];
      const ny = normals[i + 1];
      const nz = normals[i + 2];
      const length = Math.hypot(nx, ny, nz) || 1;

      normals[i] = nx / length;
      normals[i + 1] = ny / length;
      normals[i + 2] = nz / length;
    }

    return normals;
  }

  updateBuffers(options = {}) {
    this.radius = options.radius ?? this.radius;
    this.rings = Math.max(1, Math.round(options.rings ?? this.rings));
    this.slices = Math.max(8, Math.round(options.slices ?? this.slices));
    this.heightSampler = options.heightSampler ?? this.heightSampler;
    this.textureTiling = options.textureTiling ?? this.textureTiling;

    this.initBuffers();
    this.initNormalVizBuffers();
  }
}
