import { CGFappearance } from "../../../../lib/CGF.js";
import { Sphere } from "../../../primitives/Sphere.js";
import { Cylinder } from "../../../primitives/Cylinder.js";

export class Flower {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.stemHeight = options.stemHeight ?? 2;
    this.petalCount = options.petalCount ?? 6;
    this.color = options.color ?? [1, 0.3, 0.3];

    this.sphere = new Sphere(scene, 12, 8, 1);
    this.cylinder = new Cylinder(scene, 12);

    this.stemAppearance = new CGFappearance(scene);
    this.stemAppearance.setAmbient(0.1, 0.3, 0.1, 1);
    this.stemAppearance.setDiffuse(0.2, 0.6, 0.2, 1);

    this.petalAppearance = new CGFappearance(scene);
    this.petalAppearance.setAmbient(...this.color, 1);
    this.petalAppearance.setDiffuse(...this.color, 1);

    this.centerAppearance = new CGFappearance(scene);
    this.centerAppearance.setAmbient(1, 0.8, 0, 1);
    this.centerAppearance.setDiffuse(1, 0.8, 0, 1);
  }

  display() {
    this.displayStem();
    this.displayCenter();
    this.displayPetals();
  }

  displayStem() {
    this.stemAppearance.apply();

    this.scene.pushMatrix();

    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.scene.scale(0.08, 0.08, this.stemHeight);

    this.cylinder.display();

    this.scene.popMatrix();
  }

  displayCenter() {
    this.centerAppearance.apply();

    this.scene.pushMatrix();

    this.scene.translate(0, this.stemHeight, 0);
    this.scene.scale(0.2, 0.2, 0.2);

    this.sphere.display();

    this.scene.popMatrix();
  }

  displayPetals() {
    this.petalAppearance.apply();

    for (let i = 0; i < this.petalCount; i++) {
      const angle = (i / this.petalCount) * Math.PI * 2;

      this.scene.pushMatrix();

      this.scene.translate(0, this.stemHeight, 0);
      this.scene.rotate(angle, 0, 1, 0);
      this.scene.translate(0.3, 0, 0);

      this.scene.scale(0.25, 0.08, 0.15);

      this.sphere.display();

      this.scene.popMatrix();
    }
  }
}
