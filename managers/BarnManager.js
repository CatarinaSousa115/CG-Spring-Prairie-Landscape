import { CGFtexture, CGFappearance } from "../../lib/CGF.js";
import { Barn } from "../objects/barn/Barn.js";

export class BarnManager {
  constructor(scene) {
    this.scene = scene;

    this.initMaterials();
    this.initPosition();

    this.barn = new Barn(
      this.scene,
      this.barnWallMaterial,
      this.barnRoofMaterial,
      this.barnDoorMaterial,
      this.barnWindowMaterial,
      this.barnLogoMaterial
    );
  }

  initMaterials() {
    this.barnWallTexture = new CGFtexture(this.scene, "textures/barn_wall.png");
    this.barnRoofTexture = new CGFtexture(this.scene, "textures/barn_roof.png");
    this.barnDoorTexture = new CGFtexture(this.scene, "textures/barn_door.png");
    this.barnWindowTexture = new CGFtexture(this.scene, "textures/barn_window.png");
    this.barnLogoTexture = new CGFtexture(this.scene, "textures/cat_logo.png");

    this.barnWallMaterial = new CGFappearance(this.scene);
    this.barnWallMaterial.setAmbient(0.08, 0.06, 0.05, 1.0);
    this.barnWallMaterial.setDiffuse(0.22, 0.12, 0.09, 1.0);
    this.barnWallMaterial.setSpecular(0.02, 0.02, 0.02, 1.0);
    this.barnWallMaterial.setShininess(1.0);
    this.barnWallMaterial.setTexture(this.barnWallTexture);

    this.barnLogoMaterial = new CGFappearance(this.scene);
    this.barnLogoMaterial.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.barnLogoMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.barnLogoMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.barnLogoMaterial.setShininess(1.0);
    this.barnLogoMaterial.setTexture(this.barnLogoTexture);
    this.barnLogoMaterial.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");

    this.barnRoofMaterial = new CGFappearance(this.scene);
    this.barnRoofMaterial.setAmbient(0.12, 0.12, 0.12, 1.0);
    this.barnRoofMaterial.setDiffuse(0.25, 0.25, 0.25, 1.0);
    this.barnRoofMaterial.setSpecular(0.03, 0.03, 0.03, 1.0);
    this.barnRoofMaterial.setShininess(3.0);
    this.barnRoofMaterial.setTexture(this.barnRoofTexture);

    this.barnDoorMaterial = new CGFappearance(this.scene);
    this.barnDoorMaterial.setAmbient(0.25, 0.18, 0.14, 1.0);
    this.barnDoorMaterial.setDiffuse(0.45, 0.32, 0.24, 1.0);
    this.barnDoorMaterial.setSpecular(0.02, 0.02, 0.02, 1.0);
    this.barnDoorMaterial.setShininess(2.0);
    this.barnDoorMaterial.setTexture(this.barnDoorTexture);

    this.barnWindowMaterial = new CGFappearance(this.scene);
    this.barnWindowMaterial.setAmbient(0.75, 0.75, 0.75, 1.0);
    this.barnWindowMaterial.setDiffuse(0.95, 0.95, 0.95, 1.0);
    this.barnWindowMaterial.setSpecular(0.15, 0.15, 0.15, 1.0);
    this.barnWindowMaterial.setShininess(10.0);
    this.barnWindowMaterial.setTexture(this.barnWindowTexture);
  }

  initPosition() {
    const tBarn = 0.895;
    const p0 = this.scene.environmentManager.wagonPath.getPoint(tBarn);
    const p1 = this.scene.environmentManager.wagonPath.getPoint(tBarn + 0.01);

    const tangentX = p1[0] - p0[0];
    const tangentZ = p1[1] - p0[1];
    const pathSegmentLength = Math.sqrt(
      tangentX * tangentX + tangentZ * tangentZ
    );

    const normalX = -tangentZ / pathSegmentLength;
    const normalZ = tangentX / pathSegmentLength;

    const barnSideOffset = 0.6;
    this.x = p0[0] + normalX * barnSideOffset;
    this.z = p0[1] + normalZ * barnSideOffset;
    this.y = this.scene.environmentManager.terrain.getHeightAt(this.x, this.z);

    this.rotation = Math.atan2(-normalX, -normalZ) + Math.PI / 2;
  }

  display() {
    if (this.scene.displayBarn) {
      this.scene.pushMatrix();
      this.scene.translate(this.x, this.y, this.z + 9);
      this.scene.scale(2.5, 2.5, 2.5);
      this.scene.rotate(this.rotation, 0, 1, 0);
      this.barn.display();
      this.scene.popMatrix();
    }
  }
}
