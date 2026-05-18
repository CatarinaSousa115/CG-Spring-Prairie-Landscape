import { CGFobject } from "../../../lib/CGF.js";

export class RoofPrism extends CGFobject {
  constructor(scene) {
    super(scene);
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [
      // Front Triangle 
      -0.5,
      0,
      0.5, 
      0.5,
      0,
      0.5, 
      0,
      0.5,
      0.5, 

      // Back Triangle 
      -0.5,
      0,
      -0.5,
      0.5,
      0,
      -0.5,
      0,
      0.5,
      -0.5,

      // Left Slope Panel
      -0.5,
      0,
      0.5, 
      0,
      0.5,
      0.5, 
      0,
      0.5,
      -0.5, 
      -0.5,
      0,
      -0.5, 

      // Right Slope Panel
      0,
      0.5,
      0.5, 
      0.5,
      0,
      0.5, 
      0.5,
      0,
      -0.5, 
      0,
      0.5,
      -0.5, 
    ];

    this.indices = [
      0,
      1,
      2, // Front Gable
      5,
      4,
      3, // Back Gable
      6,
      7,
      8,
      6,
      8,
      9, // Left Slope
      10,
      11,
      12,
      10,
      12,
      13, // Right Slope
    ];

    const sin45 = Math.sin(Math.PI / 4);
    this.normals = [
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1, // Front
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1, // Back
      -sin45,
      sin45,
      0,
      -sin45,
      sin45,
      0,
      -sin45,
      sin45,
      0,
      -sin45,
      sin45,
      0, // Left
      sin45,
      sin45,
      0,
      sin45,
      sin45,
      0,
      sin45,
      sin45,
      0,
      sin45,
      sin45,
      0, // Right
    ];

    this.texCoords = [
      0,
      0,
      1,
      0,
      0.5,
      1, // Front Gable
      1,
      0,
      0,
      0,
      0.5,
      1, // Back Gable
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1, // Left Slope
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1, // Right Slope
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
