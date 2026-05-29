import { CGFobject, CGFappearance } from "../../../lib/CGF.js";
import { Cube } from "../../primitives/Cube.js";
import { RoofPrism } from "./RoofPrism.js";
import { Quad } from "../../primitives/Quad.js";

export class Barn extends CGFobject {
  constructor(scene, wallMat, roofMat, doorMat, windowMat, logoMat) {
    super(scene);
    this.cube = new Cube(scene);
    this.roof = new RoofPrism(scene);
    this.quad = new Quad(scene);

    this.wallMat = wallMat;
    this.roofMat = roofMat;
    this.doorMat = doorMat;
    this.windowMat = windowMat;
    this.logoMat = logoMat;
  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0, 2.1, 0);
    this.scene.scale(5, 4.2, 7);
    if (this.wallMat) this.wallMat.apply();
    this.cube.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 4.1, 0);
    this.scene.scale(5.5, 4.4, 7.4);
    if (this.roofMat) this.roofMat.apply();
    this.roof.display();
    this.scene.popMatrix();

    if (this.doorMat) {
      this.scene.pushMatrix();
      this.scene.translate(0, 1.3, 3.52);
      this.scene.scale(2.0, 2.5, 1);
      this.doorMat.apply();
      this.quad.display();
      this.scene.popMatrix();
    }

    if (this.windowMat) {
      this.windowMat.apply();

      this.scene.pushMatrix();
      this.scene.translate(-2.51, 2.2, 0);
      this.scene.rotate(-Math.PI / 2, 0, 1, 0);
      this.scene.scale(1.0, 1.0, 1);
      this.quad.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(2.51, 2.2, 0);
      this.scene.rotate(Math.PI / 2, 0, 1, 0);
      this.scene.scale(1.0, 1.0, 1);
      this.quad.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(0, 5.0, 3.55);
      this.scene.rotate(Math.PI, 0, 1, 0);
      this.scene.scale(0.8, 0.8, 1);
      this.quad.display();
      this.scene.popMatrix();
    }

      if (this.logoMat) {
      this.scene.pushMatrix();
      this.scene.translate(0, 3.5, 3.57);
      this.scene.scale(1.8, 0.9, 1);
      this.logoMat.apply();
      this.quad.display();
      this.scene.popMatrix();
    }
  }
}