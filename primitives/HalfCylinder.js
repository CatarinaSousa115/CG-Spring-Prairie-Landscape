import { CGFobject } from "../../lib/CGF.js";

// Meio cilindro unitário: largura em X, altura em Y e comprimento em Z.
export class HalfCylinder extends CGFobject {
    constructor(scene, slices = 24, stacks = 1, caps = true) {
        super(scene);

        this.slices = Math.max(3, Math.round(slices));
        this.stacks = Math.max(1, Math.round(stacks));
        this.caps = caps;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.addCurvedSurface();
        if (this.caps) this.addCaps();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    addCurvedSurface() {
        for (let zStep = 0; zStep <= this.stacks; zStep++) {
            const z = -0.5 + zStep / this.stacks;

            for (let i = 0; i <= this.slices; i++) {
                const angle = Math.PI - (i * Math.PI) / this.slices;
                const x = 0.5 * Math.cos(angle);
                const y = 0.5 * Math.sin(angle);
                const nx = Math.cos(angle);
                const ny = Math.sin(angle);

                this.vertices.push(x, y, z);
                this.normals.push(nx, ny, 0);
                this.texCoords.push(i / this.slices, zStep / this.stacks);
            }
        }

        const row = this.slices + 1;
        for (let zStep = 0; zStep < this.stacks; zStep++) {
            for (let i = 0; i < this.slices; i++) {
                const a = zStep * row + i;
                const b = a + row;

                this.indices.push(a, b, a + 1);
                this.indices.push(a + 1, b, b + 1);
            }
        }
    }

    addCaps() {
        this.addCap(-0.5, [0, 0, -1], true);
        this.addCap(0.5, [0, 0, 1], false);
    }

    addCap(z, normal, reverse) {
        const center = this.vertices.length / 3;
        this.vertices.push(0, 0, z);
        this.normals.push(...normal);
        this.texCoords.push(0.5, 0);

        for (let i = 0; i <= this.slices; i++) {
            const angle = Math.PI - (i * Math.PI) / this.slices;
            const x = 0.5 * Math.cos(angle);
            const y = 0.5 * Math.sin(angle);

            this.vertices.push(x, y, z);
            this.normals.push(...normal);
            this.texCoords.push(x + 0.5, y);
        }

        for (let i = 1; i <= this.slices; i++) {
            if (reverse) this.indices.push(center, center + i + 1, center + i);
            else this.indices.push(center, center + i, center + i + 1);
        }
    }
}
