import { CGFappearance } from "../../lib/CGF.js";
import { PathRibbon } from "../primitives/PathRibbon.js";

export class WagonPath {
    constructor(scene, terrain, options = {}) {
        this.scene = scene;
        this.terrain = terrain;

        this.visible = options.visible ?? true;
        this.width = options.width ?? 12;
        this.heightOffset = options.heightOffset ?? 0.14;
        this.sampleCount = options.sampleCount ?? 90;
        this.lastTerrainRevision = -1;
        this.lastWidth = this.width;

        this.mesh = new PathRibbon(scene, {
            width: this.width,
            samples: this.sampleCount,
            heightOffset: this.heightOffset,
            pathSampler: this.getPoint.bind(this),
            heightSampler: this.terrain.getHeightAt.bind(this.terrain)
        });

        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.38, 0.30, 0.19, 1);
        this.appearance.setDiffuse(0.66, 0.52, 0.32, 1);
        this.appearance.setSpecular(0.02, 0.02, 0.02, 1);
        this.appearance.setShininess(3);
    }

    getPoint(t) {
        const z = -100 + 200 * t;
        const x = Math.sin(t * Math.PI * 1.1 - 0.45) * 10 + Math.sin(t * Math.PI * 2.1) * 2.5;

        return [x, z];
    }

    display() {
        if (!this.visible) return;

        this.rebuildIfNeeded();
        this.appearance.apply();
        this.mesh.display();
    }

    rebuildIfNeeded() {
        if (this.lastTerrainRevision === this.terrain.revision && this.lastWidth === this.width) {
            return;
        }

        this.mesh.updateBuffers({
            width: this.width,
            samples: this.sampleCount,
            heightOffset: this.heightOffset,
            pathSampler: this.getPoint.bind(this),
            heightSampler: this.terrain.getHeightAt.bind(this.terrain)
        });
        this.lastTerrainRevision = this.terrain.revision;
        this.lastWidth = this.width;
    }

    enableNormalViz() {
        this.mesh.enableNormalViz();
    }

    disableNormalViz() {
        this.mesh.disableNormalViz();
    }
}
