import { CGFappearance } from "../../lib/CGF.js";
import { CircularTerrainMesh } from "../primitives/CircularTerrainMesh.js";

export class PrairieTerrain {
    constructor(scene, options = {}) {
        this.scene = scene;

        this.visible = options.visible ?? true;
        this.followCamera = options.followCamera ?? true;
        this.radius = options.radius ?? 80;
        this.subdivisions = options.subdivisions ?? 40;
        this.height = options.height ?? 0;
        this.elevation = options.elevation ?? 3.2;
        this.heightMapResolution = options.heightMapResolution ?? 96;
        this.hillScale = options.hillScale ?? 1;
        this.ambient = options.ambient ?? [0.18, 0.25, 0.10];
        this.diffuse = options.diffuse ?? [0.55, 0.76, 0.28];
        this.specular = options.specular ?? [0.02, 0.02, 0.02];
        this.emission = options.emission ?? [0, 0, 0];
        this.shininess = options.shininess ?? 4;
        this.revision = 0;

        this.generateHeightMap();

        this.mesh = new CircularTerrainMesh(scene, {
            radius: this.radius,
            rings: this.subdivisions,
            slices: this.subdivisions * 2,
            heightSampler: this.sampleLocalHeight.bind(this)
        });

        this.appearance = new CGFappearance(scene);
        this.updateAppearance();
    }

    generateHeightMap() {
        this.heightMap = [];

        for (let row = 0; row < this.heightMapResolution; row++) {
            const v = row / (this.heightMapResolution - 1);
            const z = v * 2 - 1;
            const heightRow = [];

            for (let col = 0; col < this.heightMapResolution; col++) {
                const u = col / (this.heightMapResolution - 1);
                const x = u * 2 - 1;
                const distance = Math.hypot(x, z);
                const edgeFade = Math.max(0, 1 - Math.pow(distance, 4));
                const h =
                    Math.sin((x * 2.1 + z * 0.7) * Math.PI * this.hillScale) * 0.45 +
                    Math.cos((z * 1.6 - x * 0.35) * Math.PI * this.hillScale) * 0.35 +
                    Math.sin((x + z) * Math.PI * 0.85 * this.hillScale) * 0.2;

                heightRow.push(h * this.elevation * edgeFade);
            }

            this.heightMap.push(heightRow);
        }
    }

    updateAppearance() {
        this.appearance.setAmbient(...this.ambient, 1);
        this.appearance.setDiffuse(...this.diffuse, 1);
        this.appearance.setSpecular(...this.specular, 1);
        this.appearance.setEmission(...this.emission, 1);
        this.appearance.setShininess(this.shininess);
    }

    setSubdivisions(subdivisions) {
        this.subdivisions = Math.max(1, Math.round(subdivisions));
        this.rebuildMesh();
    }

    setRadius(radius) {
        this.radius = radius;
        this.rebuildMesh();
    }

    setHeight(height) {
        this.height = height;
        this.revision++;
    }

    setElevation(elevation) {
        this.elevation = elevation;
        this.generateHeightMap();
        this.rebuildMesh();
    }

    setHillScale(hillScale) {
        this.hillScale = hillScale;
        this.generateHeightMap();
        this.rebuildMesh();
    }

    rebuildMesh() {
        this.mesh.updateBuffers({
            radius: this.radius,
            rings: this.subdivisions,
            slices: this.subdivisions * 2,
            heightSampler: this.sampleLocalHeight.bind(this)
        });
        this.revision++;
    }

    sampleLocalHeight(x, z) {
        const distance = Math.hypot(x, z);

        if (distance > this.radius) return 0;

        const u = (x / this.radius + 1) * 0.5;
        const v = (z / this.radius + 1) * 0.5;
        const mapX = u * (this.heightMapResolution - 1);
        const mapZ = v * (this.heightMapResolution - 1);
        const x0 = Math.floor(mapX);
        const z0 = Math.floor(mapZ);
        const x1 = Math.min(x0 + 1, this.heightMapResolution - 1);
        const z1 = Math.min(z0 + 1, this.heightMapResolution - 1);
        const tx = mapX - x0;
        const tz = mapZ - z0;

        const h00 = this.heightMap[z0][x0];
        const h10 = this.heightMap[z0][x1];
        const h01 = this.heightMap[z1][x0];
        const h11 = this.heightMap[z1][x1];
        const h0 = h00 * (1 - tx) + h10 * tx;
        const h1 = h01 * (1 - tx) + h11 * tx;

        return h0 * (1 - tz) + h1 * tz;
    }

    getHeightAt(x, z) {
        return this.height + this.sampleLocalHeight(x, z);
    }

    enableNormalViz() {
        this.mesh.enableNormalViz();
    }

    disableNormalViz() {
        this.mesh.disableNormalViz();
    }

    display() {
        if (!this.visible) return;

        this.appearance.apply();

        this.scene.pushMatrix();
        if (this.followCamera) {
            const cameraPosition = this.scene.camera.position;
            this.scene.translate(
                cameraPosition[0],
                cameraPosition[1],
                cameraPosition[2]
            );
        }
        this.scene.translate(0, this.height, 0);
        this.mesh.display();
        this.scene.popMatrix();
    }
}
