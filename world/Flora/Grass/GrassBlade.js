import { Plane } from "../../../primitives/Plane.js";

export class GrassBlade {
  constructor(scene) {
    this.scene = scene;
    this.plane = new Plane(scene);
  }

  display() {
    this.scene.pushMatrix();

    this.scene.translate(0, 0.5, 0);
    this.scene.scale(0.08, 1, 1);

    this.plane.display();

    this.scene.popMatrix();
  }
}
