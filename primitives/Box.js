import { CGFobject } from "../../lib/CGF.js";

// Caixa unitária centrada na origem.
export class Box extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.addBox(-0.5, 0.5, -0.5, 0.5, -0.5, 0.5);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    addBox(x1, x2, y1, y2, z1, z2) {
        this.addFace([x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2], [0, 0, 1]);
        this.addFace([x2, y1, z1], [x1, y1, z1], [x1, y2, z1], [x2, y2, z1], [0, 0, -1]);
        this.addFace([x1, y2, z2], [x2, y2, z2], [x2, y2, z1], [x1, y2, z1], [0, 1, 0]);
        this.addFace([x1, y1, z1], [x2, y1, z1], [x2, y1, z2], [x1, y1, z2], [0, -1, 0]);
        this.addFace([x2, y1, z2], [x2, y1, z1], [x2, y2, z1], [x2, y2, z2], [1, 0, 0]);
        this.addFace([x1, y1, z1], [x1, y1, z2], [x1, y2, z2], [x1, y2, z1], [-1, 0, 0]);
    }

    addFace(p1, p2, p3, p4, normal) {
        const base = this.vertices.length / 3;

        this.vertices.push(...p1, ...p2, ...p3, ...p4);
        this.normals.push(...normal, ...normal, ...normal, ...normal);
        this.texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
        this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
}
