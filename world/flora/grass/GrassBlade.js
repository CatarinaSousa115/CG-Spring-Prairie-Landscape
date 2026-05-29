import { CGFobject } from '../../../../lib/CGF.js';

export class GrassBlade extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
        //   X      Y    Z
            -0.05,  0.0, 0.0,   // 0: base esquerda
             0.05,  0.0, 0.0,   // 1: base direita
            -0.02,  1.0, 0.0,   // 2: topo esquerdo (ligeiramente inclinado)
             0.02,  1.0, 0.0,   // 3: topo direito
        ];

        // Dois triângulos = um quad
        // Duplicados para ser visível dos dois lados (frente e verso)
        this.indices = [
            0, 1, 2,   // frente triângulo 1
            1, 3, 2,   // frente triângulo 2
            2, 1, 0,   // verso triângulo 1
            2, 3, 1,   // verso triângulo 2
        ];

        this.normals = [
            0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
        ];

        this.texCoords = [
            0, 1,
            1, 1,
            0, 0,
            1, 0,
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}