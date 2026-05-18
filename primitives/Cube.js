import { CGFobject } from "../../lib/CGF.js";
import { Quad } from "./Quad.js";

export class Cube extends CGFobject {
  constructor(scene) {
    super(scene);
    this.quad = new Quad(scene);
  }

  display() {
    // Top
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    // Front
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    // Right
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    // Back
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    // Left
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI / 2, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    // Bottom
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI / 2, 1, 0, 0);
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();
  }
}
