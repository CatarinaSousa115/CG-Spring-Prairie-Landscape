import { Box } from "../../primitives/Box.js";

// Prisma unitário centrado na origem, com comprimento no eixo X.
export class WagonAxle {
    constructor(scene) {
        this.box = new Box(scene);
    }

    display() {
        this.box.display();
    }

    enableNormalViz() {
        this.box.enableNormalViz();
    }

    disableNormalViz() {
        this.box.disableNormalViz();
    }
}
