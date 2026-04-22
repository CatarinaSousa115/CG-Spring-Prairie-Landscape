import { CGFobject } from "../../lib/CGF.js";

export class Disk extends CGFobject {
    constructor(scene, slices = 48) {
        super(scene);

        this.slices = Math.max(3, Math.round(slices));
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [0, 0, 0];
        this.indices = [];
        this.normals = [0, 1, 0];
        this.texCoords = [0.5, 0.5];

        for (let i = 0; i <= this.slices; i++) {
            const angle = (2 * Math.PI * i) / this.slices;
            const x = Math.cos(angle);
            const z = Math.sin(angle);

            this.vertices.push(x, 0, z);
            this.normals.push(0, 1, 0);
            this.texCoords.push((x + 1) * 0.5, (z + 1) * 0.5);
        }

        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(0, i, i + 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(slices) {
        this.slices = Math.max(3, Math.round(slices));
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
