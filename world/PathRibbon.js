import { CGFobject } from "../../lib/CGF.js";

export class PathRibbon extends CGFobject {
    constructor(scene, options = {}) {
        super(scene);

        this.width = options.width ?? 5;
        this.samples = Math.max(2, Math.round(options.samples ?? 80));
        this.heightOffset = options.heightOffset ?? 0.12;
        this.pathSampler = options.pathSampler;
        this.heightSampler = options.heightSampler ?? (() => 0);

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.buildVertices();
        this.buildIndices();
        this.normals = this.computeVertexNormals();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    buildVertices() {
        for (let i = 0; i < this.samples; i++) {
            const t = i / (this.samples - 1);
            const previous = this.pathSampler(Math.max(0, t - 1 / (this.samples - 1)));
            const current = this.pathSampler(t);
            const next = this.pathSampler(Math.min(1, t + 1 / (this.samples - 1)));

            const tx = next[0] - previous[0];
            const tz = next[1] - previous[1];
            const tangentLength = Math.hypot(tx, tz) || 1;
            const nx = -tz / tangentLength;
            const nz = tx / tangentLength;
            const halfWidth = this.width * 0.5;

            const leftX = current[0] + nx * halfWidth;
            const leftZ = current[1] + nz * halfWidth;
            const rightX = current[0] - nx * halfWidth;
            const rightZ = current[1] - nz * halfWidth;
            const leftY = this.heightSampler(leftX, leftZ) + this.heightOffset;
            const rightY = this.heightSampler(rightX, rightZ) + this.heightOffset;

            this.vertices.push(leftX, leftY, leftZ);
            this.vertices.push(rightX, rightY, rightZ);
            this.texCoords.push(0, t * 12);
            this.texCoords.push(1, t * 12);
        }
    }

    buildIndices() {
        for (let i = 0; i < this.samples - 1; i++) {
            const left = i * 2;
            const right = left + 1;
            const nextLeft = left + 2;
            const nextRight = left + 3;

            this.indices.push(left, nextRight, right);
            this.indices.push(left, nextLeft, nextRight);
        }
    }

    computeVertexNormals() {
        const normals = new Array(this.vertices.length).fill(0);

        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i] * 3;
            const b = this.indices[i + 1] * 3;
            const c = this.indices[i + 2] * 3;

            const ax = this.vertices[a];
            const ay = this.vertices[a + 1];
            const az = this.vertices[a + 2];
            const bx = this.vertices[b];
            const by = this.vertices[b + 1];
            const bz = this.vertices[b + 2];
            const cx = this.vertices[c];
            const cy = this.vertices[c + 1];
            const cz = this.vertices[c + 2];

            const ux = bx - ax;
            const uy = by - ay;
            const uz = bz - az;
            const vx = cx - ax;
            const vy = cy - ay;
            const vz = cz - az;
            const nx = uy * vz - uz * vy;
            const ny = uz * vx - ux * vz;
            const nz = ux * vy - uy * vx;

            normals[a] += nx;
            normals[a + 1] += ny;
            normals[a + 2] += nz;
            normals[b] += nx;
            normals[b + 1] += ny;
            normals[b + 2] += nz;
            normals[c] += nx;
            normals[c + 1] += ny;
            normals[c + 2] += nz;
        }

        for (let i = 0; i < normals.length; i += 3) {
            const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
            normals[i] /= length;
            normals[i + 1] /= length;
            normals[i + 2] /= length;
        }

        return normals;
    }

    updateBuffers(options = {}) {
        this.width = options.width ?? this.width;
        this.samples = Math.max(2, Math.round(options.samples ?? this.samples));
        this.heightOffset = options.heightOffset ?? this.heightOffset;
        this.pathSampler = options.pathSampler ?? this.pathSampler;
        this.heightSampler = options.heightSampler ?? this.heightSampler;

        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
