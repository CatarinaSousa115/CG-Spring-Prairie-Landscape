import { CGFobject } from "../../lib/CGF.js";

export class Plane extends CGFobject {
    constructor(scene, divisions = 1) {
        super(scene);

        this.divisions = Math.max(1, divisions);
        this.patchLength = 1.0 / this.divisions;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let xCoord = -0.5;

        for (let i = 0; i <= this.divisions; i++) {
            this.vertices.push(xCoord, 0.5, 0);
            this.vertices.push(xCoord, 0.5 - this.patchLength, 0);

            const u = i / this.divisions;
            this.texCoords.push(u, 1);
            this.texCoords.push(u, 1 - this.patchLength);

            xCoord += this.patchLength;
        }

        for (let i = 0; i <= 2 * this.divisions + 1; i++) {
            this.indices.push(i);
            this.normals.push(0, 0, 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLE_STRIP;
        this.initGLBuffers();
    }

    display() {
        this.scene.pushMatrix();

        for (let i = 0; i < this.divisions; i++) {
            super.display();
            this.scene.translate(0, -this.patchLength, 0);
        }

        this.scene.popMatrix();
    }

    updateBuffers(divisions) {
        this.divisions = Math.max(1, divisions);
        this.patchLength = 1.0 / this.divisions;

        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
