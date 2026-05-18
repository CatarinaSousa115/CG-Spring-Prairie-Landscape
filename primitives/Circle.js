import { CGFobject } from "../../lib/CGF.js";

export class Circle extends CGFobject {
  constructor(scene, slices = 32) {
    super(scene);
    this.slices = slices;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [0, 0, 0];
    this.normals = [0, 1, 0];
    this.texCoords = [0.5, 0.5];

    for (let i = 0; i <= this.slices; i++) {
      let angle = (i * 2 * Math.PI) / this.slices;
      let x = Math.cos(angle);
      let z = Math.sin(angle);

      this.vertices.push(x, 0, z);
      this.normals.push(0, 1, 0);
      this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * z);
    }

    this.indices = [];
    for (let i = 1; i <= this.slices; i++) {
      this.indices.push(0, i, i + 1);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
