import { CGFobject } from '../../lib/CGF.js';

/**
* Pyramid
* @constructor
*/
export class Pyramid extends CGFobject {
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

        var ang = 0;
        var alphaAng = 2 * Math.PI / this.slices;

        for (var i = 0; i < this.slices; i++) {

            var sa = Math.sin(ang);
            var ca = Math.cos(ang);
            var saa = Math.sin(ang + alphaAng);
            var caa = Math.cos(ang + alphaAng);

            this.vertices.push(ca, 0, sa);
            this.vertices.push(caa, 0, saa);
            this.vertices.push(0, 1, 0);

            var nx = Math.cos(ang + alphaAng / 2);
            var ny = 0.5;
            var nz = Math.sin(ang + alphaAng / 2);
            
            var len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx /= len; ny /= len; nz /= len;

            this.normals.push(nx, ny, nz);
            this.normals.push(nx, ny, nz);
            this.normals.push(nx, ny, nz);

            this.indices.push(3 * i, 3 * i + 1, 3 * i + 2);

            this.texCoords.push(0, 1);
            this.texCoords.push(1, 1);
            this.texCoords.push(0.5, 0);

            ang += alphaAng;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(slices, stacks) {
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
}
