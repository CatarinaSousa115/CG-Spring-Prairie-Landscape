import { CGFappearance } from "../../lib/CGF.js";
import { PerturbedRock } from "../primitives/PerturbedRock.js";

export class RockField {
    constructor(scene, terrain, options = {}) {
        this.scene = scene;
        this.terrain = terrain;

        this.visible = options.visible ?? true;
        this.heightOffset = options.heightOffset ?? 0.65;
        this.rockScale = options.rockScale ?? 1;
        this.rocks = this.createRocks();
        this.geometries = this.rocks.map((rock, index) => new PerturbedRock(scene, {
            seed: 100 + index * 17,
            sectors: rock[7],
            stacks: Math.max(6, Math.round(rock[7] * 0.55)),
            roughness: rock[8]
        }));

        this.appearances = this.createAppearances();
    }

    createAppearances() {
        const materials = [
            {
                ambient: [0.25, 0.25, 0.23],
                diffuse: [0.55, 0.54, 0.49],
                specular: [0.08, 0.08, 0.07]
            },
            {
                ambient: [0.19, 0.21, 0.21],
                diffuse: [0.42, 0.45, 0.44],
                specular: [0.07, 0.08, 0.08]
            },
            {
                ambient: [0.30, 0.24, 0.17],
                diffuse: [0.58, 0.45, 0.30],
                specular: [0.08, 0.06, 0.04]
            }
        ];

        return materials.map((material) => {
            const appearance = new CGFappearance(this.scene);
            appearance.setAmbient(...material.ambient, 1);
            appearance.setDiffuse(...material.diffuse, 1);
            appearance.setSpecular(...material.specular, 1);
            appearance.setShininess(12);
            return appearance;
        });
    }

    createRocks() {
        return [
            [-12, -8, 2.2, 1.0, 1.5, 0.2, 0, 14, 0.28],
            [7, 12, 1.7, 0.8, 1.2, -0.5, 1, 12, 0.25],
            [15, -6, 1.3, 0.7, 1.0, 0.9, 2, 10, 0.23],
            [-22, 18, 1.9, 0.9, 1.3, -0.15, 0, 12, 0.27],
            [-58, -58, 2.4, 1.0, 1.6, 0.35, 0, 14, 0.28],
            [-52, 52, 1.6, 0.8, 1.2, -0.2, 1, 12, 0.22],
            [-38, -9, 2.1, 1.1, 1.4, 0.8, 2, 14, 0.26],
            [-26, 39, 1.3, 0.7, 1.1, -0.6, 0, 10, 0.24],
            [-14, -54, 1.7, 0.8, 1.3, 1.2, 1, 12, 0.3],
            [4, 59, 2.0, 0.9, 1.5, 0.15, 2, 14, 0.25],
            [18, -17, 1.5, 0.7, 1.0, -0.75, 0, 10, 0.24],
            [31, -48, 2.6, 1.2, 1.7, 0.45, 1, 14, 0.31],
            [39, 19, 1.8, 0.8, 1.4, -1.1, 2, 12, 0.27],
            [56, -5, 1.4, 0.6, 1.0, 0.7, 0, 10, 0.23],
            [62, 45, 2.2, 1.0, 1.4, -0.35, 1, 14, 0.29]
        ];
    }

    display() {
        if (!this.visible) return;

        for (let i = 0; i < this.rocks.length; i++) {
            this.displayRock(this.rocks[i], this.geometries[i]);
        }
    }

    displayRock(rock, geometry) {
        const [x, z, sx, sy, sz, rotation, materialIndex] = rock;
        const y = this.terrain.getHeightAt(x, z) + this.heightOffset * sy * this.rockScale;

        this.appearances[materialIndex].apply();

        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.rotate(rotation, 0, 1, 0);
        this.scene.scale(
            sx * this.rockScale,
            sy * this.rockScale,
            sz * this.rockScale
        );
        geometry.display();
        this.scene.popMatrix();
    }

    getCollisionObjects() {
        return this.rocks.map((rock) => {
            const [x, z, sx, , sz] = rock;
            return {
                x,
                z,
                radius: Math.max(sx, sz) * this.rockScale
            };
        });
    }

    enableNormalViz() {
        for (const geometry of this.geometries) {
            geometry.enableNormalViz();
        }
    }

    disableNormalViz() {
        for (const geometry of this.geometries) {
            geometry.disableNormalViz();
        }
    }

    isNearRock(x, z, margin = 2.0) {
    for (const rock of this.rocks) {
        const [rx, rz, sx, , sz] = rock;
        const radius = Math.max(sx, sz) * this.rockScale + margin;
        const dx = x - rx;
        const dz = z - rz;
        if (dx * dx + dz * dz < radius * radius) return true;
    }
    return false;
}
}
