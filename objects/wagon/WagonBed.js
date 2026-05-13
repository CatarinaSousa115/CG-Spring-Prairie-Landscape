import { Box } from "../../primitives/Box.js";

// Caixa aberta unitária, centrada na origem.
export class WagonBed {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.box = new Box(scene);
        this.floorThickness = options.floorThickness ?? 0.12;
        this.sideThickness = options.sideThickness ?? 0.08;
    }

    display() {
        const f = this.floorThickness;
        const s = this.sideThickness;

        this.displayBox(-0.5, 0.5, -0.5, -0.5 + f, -0.5, 0.5);
        this.displayBox(-0.5, -0.5 + s, -0.5 + f, 0.5, -0.5, 0.5);
        this.displayBox(0.5 - s, 0.5, -0.5 + f, 0.5, -0.5, 0.5);
        this.displayBox(-0.5 + s, 0.5 - s, -0.5 + f, 0.5, -0.5, -0.5 + s);
        this.displayBox(-0.5 + s, 0.5 - s, -0.5 + f, 0.5, 0.5 - s, 0.5);
    }

    displayBox(x1, x2, y1, y2, z1, z2) {
        this.scene.pushMatrix();
        this.scene.translate(
            (x1 + x2) / 2,
            (y1 + y2) / 2,
            (z1 + z2) / 2
        );
        this.scene.scale(x2 - x1, y2 - y1, z2 - z1);
        this.box.display();
        this.scene.popMatrix();
    }

    enableNormalViz() {
        this.box.enableNormalViz();
    }

    disableNormalViz() {
        this.box.disableNormalViz();
    }
}
