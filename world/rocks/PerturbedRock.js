import { CGFobject } from "../../../lib/CGF.js";

export class PerturbedRock extends CGFobject {
    constructor(scene, options = {}) {
        super(scene);

        this.sectors = options.sectors ?? 14;
        this.stacks = options.stacks ?? 8;
        this.seed = options.seed ?? 1;
        this.roughness = options.roughness ?? 0.22;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for (let i = 0; i <= this.stacks; i++) {
            const stackAngle = Math.PI / 2 - (i * Math.PI) / this.stacks;
            const ringRadius = Math.cos(stackAngle);
            const y = Math.sin(stackAngle);

            for (let j = 0; j <= this.sectors; j++) {
                const sectorAngle = (j * 2 * Math.PI) / this.sectors;
                const x = ringRadius * Math.cos(sectorAngle);
                const z = ringRadius * Math.sin(sectorAngle);
                const perturb = this.getPerturbation(i, j);

                this.vertices.push(x * perturb, y * perturb, z * perturb);
                this.normals.push(x, y, z);
                this.texCoords.push(j / this.sectors, i / this.stacks);
            }
        }

        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.sectors; j++) {
                const a = i * (this.sectors + 1) + j;
                const b = a + this.sectors + 1;

                this.indices.push(a, b, a + 1);
                this.indices.push(b, b + 1, a + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    getPerturbation(stack, sector) {
        const n1 = this.random(this.seed + stack * 19 + sector * 37);
        const n2 = this.random(this.seed * 3 + stack * 31 - sector * 11);
        const wave = Math.sin(stack * 1.7 + sector * 0.9 + this.seed) * 0.5 + 0.5;

        return 1 + (n1 * 0.55 + n2 * 0.3 + wave * 0.15 - 0.5) * this.roughness;
    }

    random(value) {
        const x = Math.sin(value * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    }
}
