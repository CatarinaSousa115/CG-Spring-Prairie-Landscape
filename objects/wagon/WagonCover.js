import { HalfCylinder } from "../../primitives/HalfCylinder.js";
import { Box } from "../../primitives/Box.js";

// Cobertura arqueada unitária.
export class WagonCover {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.ribCount = options.ribCount ?? 5;
        this.ribThickness = options.ribThickness ?? 0.035;
        this.wallHeight = options.wallHeight ?? 0.32;
        this.skirtHeight = options.skirtHeight ?? 0.18;
        this.sideInset = options.sideInset ?? 0.055;
        this.rib = new HalfCylinder(scene, options.slices ?? 24, 1, false);
        this.ribBlock = new Box(scene);
        this.cover = new HalfCylinder(
            scene,
            options.slices ?? 24,
            options.stacks ?? 4,
            options.caps ?? true
        );
    }

    display(canvasAppearance = null, frameAppearance = null) {
        canvasAppearance?.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, this.wallHeight, 0);
        this.cover.display();
        this.scene.popMatrix();
        this.displaySkirt();

        frameAppearance?.apply();
        this.displayRibs();
    }

    displaySkirt() {
        const x = 0.5 - this.sideInset;
        const t = this.ribThickness * 0.9;

        this.displayBox(-x, -x + t, this.wallHeight - this.skirtHeight, this.wallHeight, -0.5, 0.5);
        this.displayBox(x - t, x, this.wallHeight - this.skirtHeight, this.wallHeight, -0.5, 0.5);
    }

    displayRibs() {
        if (this.ribCount <= 0) return;

        for (let i = 0; i < this.ribCount; i++) {
            const t = this.ribCount === 1 ? 0.5 : i / (this.ribCount - 1);
            const z = -0.5 + t;

            this.scene.pushMatrix();
            this.scene.translate(0, this.wallHeight, z);
            this.scene.scale(1.04, 1.04, this.ribThickness);
            this.rib.display();
            this.scene.popMatrix();

            this.displayRibLegs(z);
        }
    }

    displayRibLegs(z) {
        const t = this.ribThickness;
        const x = 0.5 - this.sideInset;

        this.displayBox(-x - t / 2, -x + t / 2, -0.02, this.wallHeight, z - t / 2, z + t / 2);
        this.displayBox(x - t / 2, x + t / 2, -0.02, this.wallHeight, z - t / 2, z + t / 2);
    }

    displayBox(x1, x2, y1, y2, z1, z2) {
        this.scene.pushMatrix();
        this.scene.translate((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
        this.scene.scale(x2 - x1, y2 - y1, z2 - z1);
        this.ribBlock.display();
        this.scene.popMatrix();
    }

    enableNormalViz() {
        this.cover.enableNormalViz();
        this.rib.enableNormalViz();
        this.ribBlock.enableNormalViz();
    }

    disableNormalViz() {
        this.cover.disableNormalViz();
        this.rib.disableNormalViz();
        this.ribBlock.disableNormalViz();
    }
}
