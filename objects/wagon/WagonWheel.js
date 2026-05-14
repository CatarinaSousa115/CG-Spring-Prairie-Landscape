import { CGFobject } from "../../../lib/CGF.js";
import { Disk } from "../../primitives/Disk.js";

// Roda no plano XY, com espessura no eixo Z.
export class WagonWheel extends CGFobject {
    constructor(scene, options = {}) {
        super(scene);

        this.slices = options.slices ?? 32;
        this.outerRadius = options.outerRadius ?? 1.0;
        this.innerRadius = options.innerRadius ?? 0.78;
        this.hubRadius = options.hubRadius ?? 0.22;
        this.thickness = options.thickness ?? 0.22;
        this.spokeWidth = options.spokeWidth ?? 0.055;
        this.spokes = options.spokes ?? 12;

        this.hubDisk = new Disk(scene, this.slices);

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.addOuterRim();
        this.addHubSide();
        this.addSpokes();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    addOuterRim() {
        const zFront = this.thickness / 2;
        const zBack = -this.thickness / 2;

        for (let i = 0; i < this.slices; i++) {
            const a1 = (i * 2 * Math.PI) / this.slices;
            const a2 = ((i + 1) * 2 * Math.PI) / this.slices;

            const outerFront1 = this.point(this.outerRadius, a1, zFront);
            const outerFront2 = this.point(this.outerRadius, a2, zFront);
            const innerFront1 = this.point(this.innerRadius, a1, zFront);
            const innerFront2 = this.point(this.innerRadius, a2, zFront);

            const outerBack1 = this.point(this.outerRadius, a1, zBack);
            const outerBack2 = this.point(this.outerRadius, a2, zBack);
            const innerBack1 = this.point(this.innerRadius, a1, zBack);
            const innerBack2 = this.point(this.innerRadius, a2, zBack);

            this.addQuad(outerFront1, outerFront2, innerFront2, innerFront1, [0, 0, 1]);

            this.addQuad(outerBack2, outerBack1, innerBack1, innerBack2, [0, 0, -1]);

            this.addQuad(
                outerBack1,
                outerBack2,
                outerFront2,
                outerFront1,
                [Math.cos((a1 + a2) / 2), Math.sin((a1 + a2) / 2), 0]
            );

            this.addQuad(
                innerFront1,
                innerFront2,
                innerBack2,
                innerBack1,
                [-Math.cos((a1 + a2) / 2), -Math.sin((a1 + a2) / 2), 0]
            );
        }
    }

    addHubSide() {
        const zFront = this.thickness / 2 + 0.035;
        const zBack = -this.thickness / 2 - 0.035;

        for (let i = 0; i < this.slices; i++) {
            const a1 = (i * 2 * Math.PI) / this.slices;
            const a2 = ((i + 1) * 2 * Math.PI) / this.slices;

            const front1 = this.point(this.hubRadius, a1, zFront);
            const front2 = this.point(this.hubRadius, a2, zFront);
            const back1 = this.point(this.hubRadius, a1, zBack);
            const back2 = this.point(this.hubRadius, a2, zBack);

            this.addQuad(
                back1,
                back2,
                front2,
                front1,
                [Math.cos((a1 + a2) / 2), Math.sin((a1 + a2) / 2), 0]
            );
        }
    }

    addSpokes() {
        const r1 = this.hubRadius * 0.95;
        const r2 = this.innerRadius * 0.96;
        const z = 0;
        const halfWidth = this.spokeWidth / 2;
        const halfDepth = this.thickness * 0.35;

        for (let i = 0; i < this.spokes; i++) {
            const angle = (i * 2 * Math.PI) / this.spokes;
            const radial = [Math.cos(angle), Math.sin(angle), 0];
            const tangent = [-Math.sin(angle), Math.cos(angle), 0];

            const start = [radial[0] * r1, radial[1] * r1, z];
            const end = [radial[0] * r2, radial[1] * r2, z];

            const p1 = [start[0] + tangent[0] * halfWidth, start[1] + tangent[1] * halfWidth, halfDepth];
            const p2 = [end[0] + tangent[0] * halfWidth, end[1] + tangent[1] * halfWidth, halfDepth];
            const p3 = [end[0] - tangent[0] * halfWidth, end[1] - tangent[1] * halfWidth, halfDepth];
            const p4 = [start[0] - tangent[0] * halfWidth, start[1] - tangent[1] * halfWidth, halfDepth];

            const p5 = [start[0] + tangent[0] * halfWidth, start[1] + tangent[1] * halfWidth, -halfDepth];
            const p6 = [end[0] + tangent[0] * halfWidth, end[1] + tangent[1] * halfWidth, -halfDepth];
            const p7 = [end[0] - tangent[0] * halfWidth, end[1] - tangent[1] * halfWidth, -halfDepth];
            const p8 = [start[0] - tangent[0] * halfWidth, start[1] - tangent[1] * halfWidth, -halfDepth];

            this.addQuad(p1, p2, p3, p4, [0, 0, 1]);
            this.addQuad(p8, p7, p6, p5, [0, 0, -1]);

            this.addQuad(p5, p6, p2, p1, [tangent[0], tangent[1], 0]);
            this.addQuad(p4, p3, p7, p8, [-tangent[0], -tangent[1], 0]);
            this.addQuad(p6, p7, p3, p2, [radial[0], radial[1], 0]);
            this.addQuad(p8, p5, p1, p4, [-radial[0], -radial[1], 0]);
        }
    }

    point(radius, angle, z) {
        return [
            radius * Math.cos(angle),
            radius * Math.sin(angle),
            z
        ];
    }

    addQuad(p1, p2, p3, p4, normal) {
        const base = this.vertices.length / 3;

        this.vertices.push(...p1, ...p2, ...p3, ...p4);
        this.normals.push(...normal, ...normal, ...normal, ...normal);
        this.texCoords.push(
            this.uv(p1[0], p1[1]),
            this.uv(p2[0], p2[1]),
            this.uv(p3[0], p3[1]),
            this.uv(p4[0], p4[1])
        );

        this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    uv(x, y) {
        const u = 0.5 + x / (2 * this.outerRadius);
        const v = 0.5 - y / (2 * this.outerRadius);
        return [u, v];
    }

    display() {
        super.display();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.thickness / 2 + 0.036);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.hubRadius, this.hubRadius, this.hubRadius);
        this.hubDisk.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 0, -this.thickness / 2 - 0.036);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.hubRadius, this.hubRadius, this.hubRadius);
        this.hubDisk.display();
        this.scene.popMatrix();
    }
}
