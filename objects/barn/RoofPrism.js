  import { CGFobject } from "../../../lib/CGF.js";

export class RoofPrism extends CGFobject {
  constructor(scene) {
    super(scene);
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [
      -0.5, 0, 0.5,
      0.5, 0, 0.5,
      0, 0.7, 0.5,

      -0.5, 0, -0.5,
      0.5, 0, -0.5,
      0, 0.7, -0.5,

      -0.5, 0, 0.5,
      0, 0.7, 0.5,
      0, 0.7, -0.5,
      -0.5, 0, -0.5,

      0, 0.7, 0.5,
      0.5, 0, 0.5,
      0.5, 0, -0.5,
      0, 0.7, -0.5,
    ];

    this.indices = [
      0, 1, 2,
      5, 4, 3,

      6, 7, 8,
      6, 8, 9,

      10, 11, 12,
      10, 12, 13
    ];

    const roofAngleNormalY = Math.cos(Math.PI / 4);
    const roofAngleNormalX = Math.sin(Math.PI / 4);

    this.normals = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, -1,
      0, 0, -1,
      0, 0, -1,

      -roofAngleNormalX, roofAngleNormalY, 0,
      -roofAngleNormalX, roofAngleNormalY, 0,
      -roofAngleNormalX, roofAngleNormalY, 0,
      -roofAngleNormalX, roofAngleNormalY, 0,

      roofAngleNormalX, roofAngleNormalY, 0,
      roofAngleNormalX, roofAngleNormalY, 0,
      roofAngleNormalX, roofAngleNormalY, 0,
      roofAngleNormalX, roofAngleNormalY, 0,
    ];

    this.texCoords = [
      0, 0,
      1, 0,
      0.5, 1,

      1, 0,
      0, 0,
      0.5, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 1
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}