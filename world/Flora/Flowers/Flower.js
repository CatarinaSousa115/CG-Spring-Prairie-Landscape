import { CGFappearance } from "../../../../lib/CGF.js";
import { Sphere } from "../../../primitives/Sphere.js";
import { Cylinder } from "../../../primitives/Cylinder.js";

export class Flower {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.stemHeight = options.stemHeight ?? 1.2;
    this.petalCount = options.petalCount ?? 7;
    this.color = options.color ?? [0.75, 0.2, 0.85];

    this.baseAngle = Math.random() * Math.PI * 2;
    this.tiltAngle = (Math.random() - 0.5) * 0.18;

    // pré-calcular tudo o que é aleatório por pétala — nunca chamar Math.random() no display
    this.petalData = Array.from({ length: this.petalCount }, (_, i) => ({
      sizeMult: 0.85 + Math.random() * 0.3,
      jitter: (Math.random() - 0.5) * 0.08,
      droopAngle: 0.18 + Math.random() * 0.12,
      colorAlt: i % 2 === 0,
    }));

    this.sphere = new Sphere(scene, 10, 6, 1);
    this.cylinder = new Cylinder(scene, 8, 1);

    this._buildMaterials();
  }

  _buildMaterials() {
    const s = this.scene;
    const [r, g, b] = this.color;

    this.stemAppearance= new CGFappearance(s);
    this.stemAppearance.setAmbient(0.05, 0.22, 0.05, 1);
    this.stemAppearance.setDiffuse(0.12, 0.48, 0.12, 1);
    this.stemAppearance.setSpecular(0.02, 0.08, 0.02, 1);
    this.stemAppearance.setShininess(5);

    this.petalAppearance= new CGFappearance(s);
    this.petalAppearance.setAmbient(r * 0.7, g * 0.7, b * 0.7, 1);
    this.petalAppearance.setDiffuse(r, g, b, 1);
    this.petalAppearance.setSpecular(0.08, 0.08, 0.08, 1);
    this.petalAppearance.setShininess(8);

    this.petalTipAppearance= new CGFappearance(s);
    const lighten = (c) => Math.min(1, c + 0.18);
    this.petalTipAppearance.setAmbient(
      lighten(r) * 0.7,
      lighten(g) * 0.7,
      lighten(b) * 0.7,
      1,
    );
    this.petalTipAppearance.setDiffuse(lighten(r), lighten(g), lighten(b), 1);
    this.petalTipAppearance.setSpecular(0.08, 0.08, 0.08, 1);
    this.petalTipAppearance.setShininess(8);

    this.centerAppearance= new CGFappearance(s);
    this.centerAppearance.setAmbient(0.7, 0.5, 0.02, 1);
    this.centerAppearance.setDiffuse(0.92, 0.72, 0.05, 1);
    this.centerAppearance.setSpecular(0.3, 0.25, 0.05, 1);
    this.centerAppearance.setShininess(40);
  }

  display() {
    this.scene.pushMatrix();
    this.scene.rotate(this.tiltAngle, 0, 0, 1);
    this._displayStem();
    this._displayCenter();
    this._displayPetals();
    this.scene.popMatrix();
  }

  _displayStem() {
    this.stemAppearance.apply();
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.scene.scale(0.04, 0.04, this.stemHeight);
    this.cylinder.display();
    this.scene.popMatrix();
  }

  _displayCenter() {
    this.centerAppearance.apply();
    this.scene.pushMatrix();
    this.scene.translate(0, this.stemHeight, 0);
    this.scene.scale(0.16, 0.1, 0.16);
    this.sphere.display();
    this.scene.popMatrix();
  }

  _displayPetals() {
    for (let i = 0; i < this.petalCount; i++) {
      const pd = this.petalData[i]; // tudo pré-calculado — zero Math.random() aqui

      const angle =
        this.baseAngle + (i / this.petalCount) * Math.PI * 2 + pd.jitter;

      if (pd.colorAlt) this.petalAppearance.apply();
      else this.petalTipAppearance.apply();

      this.scene.pushMatrix();
      this.scene.translate(0, this.stemHeight, 0);
      this.scene.rotate(angle, 0, 1, 0);
      this.scene.rotate(pd.droopAngle, 0, 0, 1);
      this.scene.translate(0.22 * pd.sizeMult, 0, 0);
      this.scene.scale(0.28 * pd.sizeMult, 0.04, 0.12 * pd.sizeMult);
      this.sphere.display();
      this.scene.popMatrix();
    }
  }
}
