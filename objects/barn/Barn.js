import { CGFobject } from "../../../lib/CGF.js";
import { Cube } from "../../primitives/Cube.js";
import { RoofPrism } from "./RoofPrism.js";
import { Quad } from "../../primitives/Quad.js";

export class Barn extends CGFobject {
  constructor(scene, wallMat, roofMat, doorMat, windowMat) {
    super(scene);
    this.cube = new Cube(scene);
    this.roof = new RoofPrism(scene);
    this.quad = new Quad(scene);

    this.wallMat = wallMat;
    this.roofMat = roofMat;
    this.doorMat = doorMat;
    this.windowMat = windowMat;
  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0, 1.5, 0);
    this.scene.scale(4, 3, 6);

    if (this.wallMat) this.wallMat.apply();
    this.cube.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(0, 3, 0);
    this.scene.scale(4, 3, 6);
    if (this.roofMat) this.roofMat.apply();
    this.roof.display();
    this.scene.popMatrix();

    if (this.doorMat) {
      this.scene.pushMatrix();
      this.scene.translate(0, 1.5, 3.01);
      this.scene.scale(1.5, 1.6, 1);
      this.doorMat.apply();
      this.quad.display();
      this.scene.popMatrix();
    }


    if (this.windowMat) {
      this.windowMat.apply();

      this.scene.pushMatrix();
      this.scene.translate(-2.01, 1.8, 0);
      this.scene.rotate(-Math.PI / 2, 0, 1, 0);
      this.scene.scale(0.8, 0.8, 1);
      this.quad.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(2.01, 1.8, 0);
      this.scene.rotate(Math.PI / 2, 0, 1, 0);
      this.scene.scale(0.8, 0.8, 1);
      this.quad.display();
      this.scene.popMatrix();
    }
  }
}
