import { Box } from "../../primitives/Box.js";

// Timão frontal, centrado no eixo Z local.
export class WagonTongue {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.box = new Box(scene);

        this.length = options.length ?? 2.4;
        this.width = options.width ?? 0.12;
        this.height = options.height ?? 0.12;
        this.tipLength = options.tipLength ?? 0.28;
        this.tipWidth = options.tipWidth ?? 0.18;
        this.tipHeight = options.tipHeight ?? 0.16;
    }

    display() {
        this.displayBox(0, 0, 0, this.width, this.height, this.length);
        this.displayBox(0, 0, this.length / 2 + this.tipLength / 2, this.tipWidth, this.tipHeight, this.tipLength);
    }

    displayBox(x, y, z, width, height, length) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.scale(width, height, length);
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
