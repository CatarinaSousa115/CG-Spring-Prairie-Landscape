import { CGFtexture, CGFappearance, CGFshader } from "../../lib/CGF.js";
import { HayBale } from "../objects/bale/HayBale.js";
import { Cylinder } from "../primitives/Cylinder.js";

export class BaleManager {
  constructor(scene) {
    this.scene = scene;

    this.hayBaleTexture = new CGFtexture(this.scene, "textures/hay_bale.png");

    this.baleNormalMat = new CGFappearance(this.scene);
    this.baleNormalMat.setAmbient(1, 1, 1, 0.1);
    this.baleNormalMat.setDiffuse(0.8, 0.7, 0.0, 0.1);
    this.baleNormalMat.setSpecular(0.1, 0.1, 0.0, 0.1);
    this.baleNormalMat.setShininess(1);

    this.baleActiveMat = new CGFappearance(this.scene);
    this.baleActiveMat.setAmbient(0.0, 0.9, 0.1, 0.15);
    this.baleActiveMat.setDiffuse(0.0, 0.9, 0.1, 0.15);
    this.baleActiveMat.setSpecular(0.0, 0.1, 0.0, 0.15);
    this.baleActiveMat.setShininess(5);

    this.baleArea = new Cylinder(this.scene, 40, 1);
    this.baleAreaShader = new CGFshader(
      this.scene.gl,
      "shaders/area.vert",
      "shaders/area.frag"
    );
    this.baleAreaNormalColor = [1.0, 0.929, 0.161, 0.75];
    this.baleAreaActiveColor = [0.0, 1.0, 0.0, 0.75];

    this.baleAreaRadius = 20;
    this.baleAreaHeight = 4;
    this.wagonIntersecting = false;
    this.hayBales = [];
  }

  init() {
    const tBarn = 0.895;
    const p0 = this.scene.wagonPath.getPoint(tBarn);
    const p1 = this.scene.wagonPath.getPoint(tBarn + 0.01);

    const tangentX = p1[0] - p0[0];
    const tangentZ = p1[1] - p0[1];
    const pathSegmentLength = Math.sqrt(
      tangentX * tangentX + tangentZ * tangentZ
    );

    const normalX = -tangentZ / pathSegmentLength;
    const normalZ = tangentX / pathSegmentLength;

    const baleSideOffset = 0.6;
    this.baleAreaX = p0[0] + normalX * baleSideOffset;
    this.baleAreaZ = p0[1] + normalZ * baleSideOffset;
    this.baleAreaY =
      this.scene.terrain.getHeightAt(this.baleAreaX, this.baleAreaZ) + 0.02;

    this.spawnHayBales(15);
  }

  spawnHayBales(num) {
    const radius = 80;
    const pathMargin = this.scene.wagonPath.width / 2 + 3;
    const rockMargin = 4;
    let attempts = 0;
    const maxAttempts = num * 50;

    while (this.hayBales.length < num && attempts < maxAttempts) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      const x = dist * Math.cos(angle);
      const z = dist * Math.sin(angle);

      if (this.scene.wagonPath.isNearPath(x, z, pathMargin)) continue;
      if (this.scene.rockField.isNearRock(x, z, rockMargin)) continue;

      const dx = x - this.scene.barnX;
      const dz = z - this.scene.barnZ;
      if (Math.sqrt(dx * dx + dz * dz) < this.baleAreaRadius) continue;

      const bale = new HayBale(this.scene, this.scene.terrain, this.hayBaleTexture);
      bale.setPosition(x, z);
      this.hayBales.push(bale);
    }
  }

  update(t) {
    if (this.scene.wagon) {
      const dx = this.scene.wagon.x - this.scene.barnX;
      const dz = this.scene.wagon.z - this.scene.barnZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      this.wagonIntersecting =
        distance < this.baleAreaRadius + this.scene.collisionManager.wagonRadius;
    }
  }

  pickUpBale() {
    if (this.scene.wagon.carriedBales.length >= this.scene.wagon.maxBales)
      return;

    let nearestBale = null;
    let minDistance = 10.0;

    for (const bale of this.hayBales) {
      if (bale.isPickedUp || bale.isDelivered) continue;

      const dx = bale.x - this.scene.wagon.x;
      const dz = bale.z - this.scene.wagon.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDistance) {
        minDistance = dist;
        nearestBale = bale;
      }
    }

    if (nearestBale) {
      nearestBale.isPickedUp = true;
      this.scene.wagon.carriedBales.push(nearestBale);
    }
  }

  dropBale() {
    if (this.scene.wagon.carriedBales.length === 0) return;

    const bale = this.scene.wagon.carriedBales.pop();
    bale.isPickedUp = false;

    if (this.wagonIntersecting) {
      bale.isDelivered = true;
      this.scene.wagon.repair(15);
      const deliveredCount =
        this.hayBales.filter((b) => b.isDelivered).length - 1;

      const balesPerLayer = 4;
      const layer = Math.floor(deliveredCount / balesPerLayer);
      const indexInLayer = deliveredCount % balesPerLayer;

      const localX = 0;
      const localZ = -2.25 + indexInLayer * 1.5;
      const localY = layer * 1.5;
      const cosR = Math.cos(this.scene.barnRotation);
      const sinR = Math.sin(this.scene.barnRotation);

      const worldOffsetX = localX * cosR + localZ * sinR;
      const worldOffsetZ = -localX * sinR + localZ * cosR;

      bale.setPosition(
        this.scene.barnX + worldOffsetX,
        this.scene.barnZ + worldOffsetZ + 9
      );
      bale.y = this.scene.barnY + localY;
      bale.rotation = this.scene.barnRotation;
    } else {
      const angle = this.scene.wagon.orientation;
      const rightX = Math.cos(angle);
      const rightZ = -Math.sin(angle);

      const offset = 3.0;
      const dropX = this.scene.wagon.x + rightX * offset;
      const dropZ = this.scene.wagon.z + rightZ * offset;

      bale.setPosition(dropX, dropZ);
      bale.rotation = angle;
    }
  }

  get deliveryProgress() {
    const deliveredCount = this.hayBales.filter((b) => b.isDelivered).length;
    return `${deliveredCount}/${this.hayBales.length}`;
  }

  reset() {
    this.hayBales = [];
    this.spawnHayBales(15);
  }

  display() {
    if (this.scene.displayBaleArea) {
      this.scene.pushMatrix();
      this.scene.translate(this.baleAreaX, this.baleAreaY, this.baleAreaZ);
      this.scene.rotate(-Math.PI / 2, 1, 0, 0);
      this.scene.scale(this.baleAreaRadius, this.baleAreaRadius, this.baleAreaHeight);
      this.scene.setActiveShader(this.baleAreaShader);
      this.baleAreaShader.setUniformsValues({
        uBaseColor: this.wagonIntersecting
          ? this.baleAreaActiveColor
          : this.baleAreaNormalColor,
      });
      this.baleArea.display();
      this.scene.setActiveShader(this.scene.defaultShader);
      this.scene.popMatrix();
    }

    if (this.scene.displayHayBales) {
      for (const bale of this.hayBales) {
        bale.display();
      }
    }
  }
}
