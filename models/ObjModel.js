import { CGFobject } from "../../lib/CGF.js";

export class ObjModel extends CGFobject {
    constructor(scene, path) {
        super(scene);

        this.path = path;
        this.loaded = false;
        this.failed = false;
        this.bounds = null;

        this.load();
    }

    async load() {
        try {
            const response = await fetch(this.path);
            if (!response.ok) throw new Error(`OBJ ${response.status}`);
            const text = await response.text();
            this.parse(text);
            this.primitiveType = this.scene.gl.TRIANGLES;
            this.initGLBuffers();
            this.loaded = true;
        } catch (_error) {
            this.failed = true;
        }
    }

    parse(text) {
        const positions = [];
        const texCoords = [];
        const normals = [];

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        this.vertexMap = new Map();

        for (const rawLine of text.split("\n")) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;

            const [type, ...values] = line.split(/\s+/);

            if (type === "v") {
                const position = values.map(Number);
                positions.push(position);
                this.updateBounds(position);
            } else if (type === "vt") {
                texCoords.push(values.slice(0, 2).map(Number));
            } else if (type === "vn") {
                normals.push(values.map(Number));
            } else if (type === "f") {
                this.addFace(values, positions, texCoords, normals);
            }
        }
    }

    updateBounds(position) {
        if (!this.bounds) {
            this.bounds = {
                minX: position[0],
                maxX: position[0],
                minY: position[1],
                maxY: position[1],
                minZ: position[2],
                maxZ: position[2]
            };
            return;
        }

        this.bounds.minX = Math.min(this.bounds.minX, position[0]);
        this.bounds.maxX = Math.max(this.bounds.maxX, position[0]);
        this.bounds.minY = Math.min(this.bounds.minY, position[1]);
        this.bounds.maxY = Math.max(this.bounds.maxY, position[1]);
        this.bounds.minZ = Math.min(this.bounds.minZ, position[2]);
        this.bounds.maxZ = Math.max(this.bounds.maxZ, position[2]);
    }

    getCenter() {
        if (!this.bounds) return [0, 0, 0];

        return [
            (this.bounds.minX + this.bounds.maxX) / 2,
            (this.bounds.minY + this.bounds.maxY) / 2,
            (this.bounds.minZ + this.bounds.maxZ) / 2
        ];
    }

    addFace(tokens, positions, texCoords, normals) {
        const vertices = tokens.map((token) => this.readVertex(token, positions, texCoords, normals));

        for (let i = 1; i < vertices.length - 1; i++) {
            this.addTriangle(vertices[0], vertices[i], vertices[i + 1]);
        }
    }

    readVertex(token, positions, texCoords, normals) {
        const [positionIndex, texCoordIndex, normalIndex] = token.split("/");

        return {
            key: token,
            position: positions[this.resolveIndex(positionIndex, positions.length)],
            texCoord: texCoordIndex ? texCoords[this.resolveIndex(texCoordIndex, texCoords.length)] : null,
            normal: normalIndex ? normals[this.resolveIndex(normalIndex, normals.length)] : null
        };
    }

    resolveIndex(index, length) {
        const value = Number(index);
        return value < 0 ? length + value : value - 1;
    }

    addTriangle(a, b, c) {
        const normal = a.normal && b.normal && c.normal ? null : this.faceNormal(a.position, b.position, c.position);

        for (const vertex of [a, b, c]) {
            this.indices.push(this.addVertex(vertex, normal));
        }
    }

    addVertex(vertex, fallbackNormal) {
        if (vertex.normal && this.vertexMap.has(vertex.key)) {
            return this.vertexMap.get(vertex.key);
        }

        const index = this.vertices.length / 3;
        const n = vertex.normal ?? fallbackNormal;
        const uv = vertex.texCoord ?? [0, 0];

        this.vertices.push(...vertex.position);
        this.normals.push(...n);
        this.texCoords.push(...uv);

        if (vertex.normal) {
            this.vertexMap.set(vertex.key, index);
        }

        return index;
    }

    faceNormal(a, b, c) {
        const ux = b[0] - a[0];
        const uy = b[1] - a[1];
        const uz = b[2] - a[2];
        const vx = c[0] - a[0];
        const vy = c[1] - a[1];
        const vz = c[2] - a[2];
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const length = Math.hypot(nx, ny, nz) || 1;

        return [nx / length, ny / length, nz / length];
    }

    display() {
        if (!this.loaded) return;
        super.display();
    }
}
