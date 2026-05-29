import { CGFobject, CGFappearance } from "../../../lib/CGF.js";
import { Box } from "../../primitives/Box.js";
import { PinpointArrow } from "../ui/PinpointArrow.js";

export class HayBale extends CGFobject {
  constructor(scene, terrain = null, texture = null) {
    super(scene);
    this.terrain = terrain;

    this.box = new Box(scene);
    this.arrow = new PinpointArrow(scene);

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.isPickedUp = false;
    this.isDelivered = false;

    this.visibilityRadius = 25.0;

    this.material = new CGFappearance(scene);
    this.material.setAmbient(0.4, 0.3, 0.1, 1.0);
    this.material.setDiffuse(0.85, 0.75, 0.2, 1.0);
    this.material.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.material.setShininess(1);
    
    if (texture) {
      this.material.setTexture(texture);
      this.material.setTextureWrap('REPEAT', 'REPEAT');
    }
  }

  setPosition(x, z) {
    this.x = x;
    this.z = z;
    if (this.terrain && this.terrain.getHeightAt) {
      this.y = this.terrain.getHeightAt(x, z);
    }
  }

  isNear(x, z, radius = 2.0) {
    if (this.isDelivered) return false;
    const dx = this.x - x;
    const dz = this.z - z;
    return Math.sqrt(dx * dx + dz * dz) < radius;
  }

  display() {
    if (this.isPickedUp) return;

    const dx = this.x - this.scene.wagon.x;
    const dz = this.z - this.scene.wagon.z;
    const distSq = dx * dx + dz * dz;
    const isVisible = distSq < this.visibilityRadius * this.visibilityRadius;

    this.scene.pushMatrix();
    this.scene.translate(this.x, this.y, this.z);

    if (!this.isDelivered) {
      this.scene.pushMatrix();
      this.scene.translate(0, 5, 0);
      this.arrow.display(this.scene.time);
      this.scene.popMatrix();
    }

    if (isVisible || this.isDelivered) {
      this.scene.pushMatrix();
      this.scene.translate(0, 0.75, 0); 
      this.scene.rotate(this.rotation, 0, 1, 0);
      this.scene.scale(3.0, 1.5, 1.5);
      this.material.apply();
      this.box.display();
      this.scene.popMatrix();
    }

    this.scene.popMatrix();
  }

  displayOnWagon() {
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.scene.scale(2.0, 1.0, 1.0);
    this.material.apply();
    this.box.display();
    this.scene.popMatrix();
  }
}
