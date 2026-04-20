import { CGFobject } from '../../lib/CGF.js';

export class SemiSphere extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for (let i = 0; i <= this.stacks; i++) {
            const theta = (Math.PI / 2) * (i / this.stacks);
            const z = Math.sin(theta);
            const r = Math.cos(theta);

            for (let j = 0; j <= this.slices; j++) {
                const phi = 2 * Math.PI * (j / this.slices);

                const x = r * Math.cos(phi);
                const y = r * Math.sin(phi);

                this.vertices.push(x, y, z);

                // normais pra dentro
                this.normals.push(-x, -y, -z);

                this.texCoords.push(j / this.slices, i / this.stacks);
            }
        }

        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.slices; j++) {
                const a = i * (this.slices + 1) + j;
                const b = a + this.slices + 1;
                const c = a + 1;
                const d = b + 1;

                // triângulos virados pra dentro
                this.indices.push(a, b, c);
                this.indices.push(c, b, d);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers() {
        this.initBuffers();
    }
}