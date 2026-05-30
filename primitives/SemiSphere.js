import { CGFobject } from "../../lib/CGF.js";

export class SemiSphere extends CGFobject {
  constructor(scene, sectors, stacks, radius) {
    super(scene);
    this.sectors = sectors;
    this.stacks = stacks;
    this.radius = radius;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const sectorStep = (2 * Math.PI) / this.sectors;
    const stackStep = (Math.PI / 2) / this.stacks;
    const lengthNormal = 1.0 / this.radius;

    for (let i = 0; i <= this.stacks; ++i) {
      const stAngle = Math.PI / 2 - i * stackStep;
      const xy = this.radius * Math.cos(stAngle);
      const z = this.radius * Math.sin(stAngle);

      for (let j = 0; j <= this.sectors; ++j) {
        const seAngle = j * sectorStep;

        const x = xy * Math.cos(seAngle);
        const y = xy * Math.sin(seAngle);

        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);

        this.normals.push(-x * lengthNormal, -y * lengthNormal, -z * lengthNormal);
        this.texCoords.push(j / this.sectors, i / this.stacks);
      }
    }

    for (let i = 0; i < this.stacks; ++i) {
      for (let j = 0; j < this.sectors; ++j) {
        const a = i * (this.sectors + 1) + j;
        const b = a + this.sectors + 1;
        this.indices.push(a, a + 1, b);
        this.indices.push(a + 1, b + 1, b);
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  updateBuffers() {
    this.initBuffers();
  }
}
