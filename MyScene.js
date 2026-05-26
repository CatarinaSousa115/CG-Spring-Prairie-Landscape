import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance, CGFshader} from "../lib/CGF.js";
import { SkyDome } from "./world/SkyDome.js";
import { PrairieTerrain } from "./world/PrairieTerrain.js";
import { Sun } from "./world/Sun.js";
import { CloudLayer } from "./world/CloudLayer.js";
import { DirtPatchLayer } from "./world/DirtPatchLayer.js";
import { WagonPath } from "./world/WagonPath.js";
import { RockField } from "./world/RockField.js";
import { Wagon } from "./objects/wagon/Wagon.js";
import { Horse } from "./objects/horse/Horse.js";
import { ObjModel } from "./primitives/ObjModel.js";
import { GrassField } from "./world/Flora/Grass/GrassField.js";
import { FlowerField } from "./world/Flora/Flowers/FlowerField.js";
import { Barn } from "./objects/barn/Barn.js";
import { Cylinder } from "./primitives/Cylinder.js";
import { HayBale } from "./objects/bale/HayBale.js";

export class MyScene extends CGFscene {
  constructor() {
    super();
  }

  init(application) {
    super.init(application);
    this.enableTextures(true);

    this.initCameras();

    this.gl.clearColor(0.45, 0.65, 1.0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.axis = new CGFaxis(this);
    this.skyDome = new SkyDome(this, {
      radius: 100,
      slices: 48,
      stacks: 24,
      followCamera: false,
    });
    this.terrain = new PrairieTerrain(this, {
      radius: this.skyDome.radius,
      subdivisions: 40,
      elevation: 3.2,
      hillScale: 0.85,
      height: 0,
      followCamera: false,
      texturePath: "textures/prairie.png",
      textureTiling: 25,
    });

    this.sun = new Sun(this, {
      radius: 82,
      sunSize: 7,
    });
    this.cloudLayer = new CloudLayer(this, {
      orbitRadius: 72,
      height: 15,
      brightness: 0.72,
      followCamera: false,
    });

    this.dirtPatchLayer = new DirtPatchLayer(this, this.terrain);
    this.wagonPath = new WagonPath(this, this.terrain);
    this.rockField = new RockField(this, this.terrain);
    this.wagon = new Wagon(this, this.terrain);
    this.wagon.x = 0;
    this.wagon.z = 0;

    this.horseModel = new ObjModel(this, "models/horse/horse.obj");
    this.horseTexture = new CGFtexture(this, "models/horse/Horse_v01.jpg");
    this.horses = [
      new Horse(this, this.terrain, {
        model: this.horseModel,
        texture: this.horseTexture,
        lateralOffset: -0.95,
      }),
      new Horse(this, this.terrain, {
        model: this.horseModel,
        texture: this.horseTexture,
        lateralOffset: 0.95,
      }),
    ];

    this.cameraFollowHorse = true;
    this.cameraFollowDistance = 50;
    this.cameraFollowHeight = 15;
    this.cameraFollowLookAhead = 3.6;
    this.cameraFollowSmoothing = 0.16;
    this.cameraFollowPosition = null;
    this.cameraFollowTarget = null;

    this.grassField = new GrassField(this, {
      terrain: this.terrain,
      wagonPath: this.wagonPath,
      rockField: this.rockField,
      dirtLayer: this.dirtPatchLayer,
      numBlades: 12000,
      areaRadius: 100,
      deadRatio: 0.25,
      windSpeed: 1.2,
      windStrength: 0.18,
    });

    const tBarn = 0.68;
    const p0 = this.wagonPath.getPoint(tBarn);
    const p1 = this.wagonPath.getPoint(tBarn + 0.01);

    const tangentX = p1[0] - p0[0];
    const tangentZ = p1[1] - p0[1];
    const pathSegmentLength = Math.sqrt(
      tangentX * tangentX + tangentZ * tangentZ,
    );

    const normalX = -tangentZ / pathSegmentLength;
    const normalZ = tangentX / pathSegmentLength;

    const barnSideOffset = 9.5;
    this.barnX = p0[0] + normalX * barnSideOffset;
    this.barnZ = p0[1] + normalZ * barnSideOffset;
    this.barnY = this.terrain.getHeightAt(this.barnX, this.barnZ);

    this.barnRotation = Math.atan2(-normalX, -normalZ);

    const baleSideOffset = 4.5;
    this.baleAreaX = p0[0] + normalX * baleSideOffset;
    this.baleAreaZ = p0[1] + normalZ * baleSideOffset;
    this.baleAreaY =
      this.terrain.getHeightAt(this.baleAreaX, this.baleAreaZ) + 0.02;

    this.baleAreaRadius = 20;
    this.baleAreaHeight = 4;
    this.wagonIntersecting = false;

    this.barnWallTexture = new CGFtexture(this, "textures/barn_wall.png");
    this.barnRoofTexture = new CGFtexture(this, "textures/barn_roof.png");
    this.barnDoorTexture = new CGFtexture(this, "textures/barn_door.png");
    this.barnWindowTexture = new CGFtexture(this, "textures/barn_window.png");
    this.hayBaleTexture = new CGFtexture(this, "textures/hay_bale.png");

    this.barnWallMaterial = new CGFappearance(this);
    this.barnWallMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.barnWallMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
    this.barnWallMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.barnWallMaterial.setShininess(10.0);
    this.barnWallMaterial.setTexture(this.barnWallTexture);

    this.barnRoofMaterial = new CGFappearance(this);
    this.barnRoofMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.barnRoofMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
    this.barnRoofMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.barnRoofMaterial.setShininess(10.0);
    this.barnRoofMaterial.setTexture(this.barnRoofTexture);

    this.barnDoorMaterial = new CGFappearance(this);
    this.barnDoorMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
    this.barnDoorMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
    this.barnDoorMaterial.setTexture(this.barnDoorTexture);

    this.barnWindowMaterial = new CGFappearance(this);
    this.barnWindowMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.barnWindowMaterial.setDiffuse(0.9, 0.9, 0.9, 1.0);
    this.barnWindowMaterial.setTexture(this.barnWindowTexture);

    this.baleNormalMat = new CGFappearance(this);
    this.baleNormalMat.setAmbient(1, 1, 1, 0.1);
    this.baleNormalMat.setDiffuse(0.8, 0.7, 0.0, 0.1);
    this.baleNormalMat.setSpecular(0.1, 0.1, 0.0, 0.1);
    this.baleNormalMat.setShininess(1);

    this.baleActiveMat = new CGFappearance(this);
    this.baleActiveMat.setAmbient(0.0, 0.9, 0.1, 0.15);
    this.baleActiveMat.setDiffuse(0.0, 0.9, 0.1, 0.15);
    this.baleActiveMat.setSpecular(0.0, 0.1, 0.0, 0.15);
    this.baleActiveMat.setShininess(5);

    this.barn = new Barn(
      this,
      this.barnWallMaterial,
      this.barnRoofMaterial,
      this.barnDoorMaterial,
      this.barnWindowMaterial,
    );

    this.baleArea = new Cylinder(this, 40, 1);
    this.baleAreaShader = new CGFshader(
      this.gl,
      "shaders/area.vert",
      "shaders/area.frag",
    );
    this.baleAreaNormalColor = [1.0, 0.929, 0.161, 0.75];
    this.baleAreaActiveColor = [0.0, 1.0, 0.0, 0.75];

    this.initLights();
    this.setUpdatePeriod(50);

    this.displayAxis = true;
    this.displaySky = true;
    this.displayTerrain = true;
    this.displayNormals = false;
    this.displaySun = true;
    this.displayClouds = true;
    this.displayDirtPatches = true;
    this.displayWagonPath = true;
    this.displayRocks = true;
    this.displayWagon = true;
    this.displayHorse = true;
    this.displayGrass = true;
    this.displayFlowers = true;
    this.displayBarn = true;
    this.displayBaleArea = true;
    this.displayHayBales = true;

    this.sunLightEnabled = true;
    this.scaleFactor = 2.0;
    this.sunAngle = 0;
    this.time = 0;
    this.startTime = undefined;
    this.gameStatus = "playing"; 

    this.lastPathWidth = this.wagonPath.width;
    this.flowerField = new FlowerField(
      this,
      350,
      100,
      this.terrain,
      this.wagonPath,
      0,
      0,
    );

    this.hayBales = [];
    this.spawnHayBales(15);

    // COlisao
    this.wagonRadius = 1.8;
    this.horseRadius = 1.2;
    this.barnRadius = 8.5;
    this.worldBoundaryRadius = 90;

    this.collisionCooldown = 0;

    // botao HTML
    const restartBtn = document.getElementById("restart-button");
    if (restartBtn) restartBtn.onclick = () => this.restartGame();
  }

  spawnHayBales(num) {
    const radius = 80;
    const pathMargin = this.wagonPath.width / 2 + 3;
    const rockMargin = 4;
    let attempts = 0;
    const maxAttempts = num * 50;

    while (this.hayBales.length < num && attempts < maxAttempts) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radius;
      const x = dist * Math.cos(angle);
      const z = dist * Math.sin(angle);

      if (this.wagonPath.isNearPath(x, z, pathMargin)) continue;

      if (this.rockField.isNearRock(x, z, rockMargin)) continue;

      const dx = x - this.barnX;
      const dz = z - this.barnZ;
      if (Math.sqrt(dx * dx + dz * dz) < this.baleAreaRadius) continue;

      const bale = new HayBale(this, this.terrain, this.hayBaleTexture);
      bale.setPosition(x, z);
      this.hayBales.push(bale);
    }
  }

  initLights() {
    this.setGlobalAmbientLight(0.18, 0.2, 0.16, 1.0);

    this.lights[0].setAmbient(0.18, 0.16, 0.12, 1.0);
    this.lights[0].setDiffuse(1.0, 0.92, 0.72, 1.0);
    this.lights[0].setSpecular(0.6, 0.52, 0.38, 1.0);
    this.lights[0].enable();
    this.lights[0].setVisible(true);
  }

  updateSunLight() {
    if (!this.sunLightEnabled) {
      this.lights[0].disable();
      this.lights[0].update();
      return;
    }

    const sunPosition = this.sun.getScenePosition();

    this.lights[0].enable();
    this.lights[0].setPosition(
      sunPosition[0],
      sunPosition[1],
      sunPosition[2],
      1.0,
    );
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      0.6,
      0.1,
      500,
      vec3.fromValues(45, 28, 45),
      vec3.fromValues(0, 0, 0),
    );
  }

  update(t) {
    if (this.gameStatus !== "playing") return;

    if (this.startTime === undefined) this.startTime = t;

    this.time = (t - this.startTime) * 0.001;

    const timeDisplay = document.getElementById("time-display");
    if (timeDisplay) timeDisplay.innerText = this.gameTime;

    const hpFill = document.getElementById("hp-fill");
    if (hpFill && this.wagon) {
      const hpPercent = Math.max(0, (this.wagon.hp / this.wagon.maxHP) * 100);
      hpFill.style.width = `${hpPercent}%`;
    }

    const balesDelivered = document.getElementById("bales-delivered");
    if (balesDelivered) balesDelivered.innerText = this.deliveryProgress;

    this.cloudLayer.update(t);

    if (this.wagon) {
      this.wagon.update(t);
      this.checkCollision();

      const dx = this.wagon.x - this.barnX;
      const dz = this.wagon.z - this.barnZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      this.wagonIntersecting =
        distance < this.baleAreaRadius + this.wagonRadius;

      this.checkKeys();
      this.checkGameStatus();
    }

    if (this.horses && this.wagon) {
      for (const horse of this.horses) {
        horse.followWagon(this.wagon);
      }
    }

    this.updateFollowCamera();

    if (this.wagonPath.width !== this.lastPathWidth) {
      this.lastPathWidth = this.wagonPath.width;
      this.grassField.rebuild();
    }
  }

  checkGameStatus() {
    if (this.wagon.isDead) {
      this.endGame(false);
      return;
    }

    const deliveredCount = this.hayBales.filter((b) => b.isDelivered).length;
    if (deliveredCount === this.hayBales.length && this.hayBales.length > 0) {
      this.endGame(true);
    }
  }

  endGame(win) {
    this.gameStatus = win ? "won" : "lost";
    const overlay = document.getElementById("game-overlay");
    const title = document.getElementById("status-title");
    const message = document.getElementById("status-message");
    const button = document.getElementById("restart-button");

    if (overlay) overlay.style.display = "block";
    if (win) {
      if (title) {
        title.innerText = "YOU WIN!";
        title.style.color = "#00ff00";
      }
      if (message)
        message.innerText = `Congratulations! All bales delivered in ${this.gameTime}.`;
      if (button) button.innerText = "PLAY AGAIN";
    } else {
      if (title) {
        title.innerText = "GAME OVER";
        title.style.color = "#ff0000";
      }
      if (message) message.innerText = "Your wagon was destroyed.";
      if (button) button.innerText = "RETRY";
    }
  }

  restartGame() {
    this.gameStatus = "playing";
    this.startTime = undefined;
    this.time = 0;

    this.wagon.hp = this.wagon.maxHP;
    this.wagon.isDead = false;
    this.wagon.x = 0;
    this.wagon.z = 0;
    this.wagon.speed = 0;
    this.wagon.orientation = 0;
    this.wagon.carriedBales = [];

    this.hayBales = [];
    this.spawnHayBales(15);

    const overlay = document.getElementById("game-overlay");
    if (overlay) overlay.style.display = "none";
  }

  updateFollowCamera() {
    if (!this.cameraFollowHorse || !this.horses?.length || !this.camera) return;

    const horseCenter = this.getHorseTeamCenter();
    if (!horseCenter) return;

    const orientation = this.wagon?.orientation ?? this.horses[0].orientation ?? 0;
    const directionX = Math.sin(orientation);
    const directionZ = Math.cos(orientation);
    const scale = this.scaleFactor ?? 1;

    const target = [
      (horseCenter.x + directionX * this.cameraFollowLookAhead) * scale,
      (horseCenter.y + 1.8) * scale,
      (horseCenter.z + directionZ * this.cameraFollowLookAhead) * scale,
    ];

    const position = [
      (horseCenter.x - directionX * this.cameraFollowDistance) * scale,
      (horseCenter.y + this.cameraFollowHeight) * scale,
      (horseCenter.z - directionZ * this.cameraFollowDistance) * scale,
    ];

    this.cameraFollowPosition = this.lerpCameraPoint(
      this.cameraFollowPosition,
      position,
      this.cameraFollowSmoothing,
    );
    this.cameraFollowTarget = this.lerpCameraPoint(
      this.cameraFollowTarget,
      target,
      this.cameraFollowSmoothing,
    );

    this.camera.setPosition(vec3.fromValues(...this.cameraFollowPosition));
    this.camera.setTarget(vec3.fromValues(...this.cameraFollowTarget));
  }

  getHorseTeamCenter() {
    if (!this.horses?.length) return null;

    let x = 0;
    let y = 0;
    let z = 0;

    for (const horse of this.horses) {
      x += horse.x;
      y += horse.y;
      z += horse.z;
    }

    return {
      x: x / this.horses.length,
      y: y / this.horses.length,
      z: z / this.horses.length,
    };
  }

  lerpCameraPoint(current, target, amount) {
    if (!current) return [...target];

    return [
      current[0] + (target[0] - current[0]) * amount,
      current[1] + (target[1] - current[1]) * amount,
      current[2] + (target[2] - current[2]) * amount,
    ];
  }

  checkKeys() {
    const pPressed = this.gui.isKeyPressed("KeyP");
    if (pPressed && !this.lastPPressed) {
      this.pickUpBale();
    }
    this.lastPPressed = pPressed;

    const lPressed = this.gui.isKeyPressed("KeyL");
    if (lPressed && !this.lastLPressed) {
      this.dropBale();
    }
    this.lastLPressed = lPressed;
  }

  pickUpBale() {
    if (this.wagon.carriedBales.length >= this.wagon.maxBales) return;

    let nearestBale = null;
    let minDistance = 10.0;

    for (const bale of this.hayBales) {
      if (bale.isPickedUp || bale.isDelivered) continue;

      const dx = bale.x - this.wagon.x;
      const dz = bale.z - this.wagon.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDistance) {
        minDistance = dist;
        nearestBale = bale;
      }
    }

    if (nearestBale) {
      nearestBale.isPickedUp = true;
      this.wagon.carriedBales.push(nearestBale);
    }
  }

  get deliveryProgress() {
    const delivered = this.hayBales.filter((b) => b.isDelivered).length;
    return `${delivered}/${this.hayBales.length}`;
  }

  get gameTime() {
    const mins = Math.floor(this.time / 60);
    const secs = Math.floor(this.time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  dropBale() {
    if (this.wagon.carriedBales.length === 0) return;

    const bale = this.wagon.carriedBales.pop();
    bale.isPickedUp = false;

    if (this.wagonIntersecting) {
      bale.isDelivered = true;
      this.wagon.repair(15);
      const deliveredCount =
        this.hayBales.filter((b) => b.isDelivered).length - 1;

      // Organizacao em grelha dentro do celeiro
      const balesPerLayer = 4;
      const layer = Math.floor(deliveredCount / balesPerLayer);
      const indexInLayer = deliveredCount % balesPerLayer;

      const localX = 0;
      const localZ = -2.25 + indexInLayer * 1.5; 
      const localY = layer * 1.5; 
      const cosR = Math.cos(this.barnRotation);
      const sinR = Math.sin(this.barnRotation);

      const worldOffsetX = localX * cosR + localZ * sinR;
      const worldOffsetZ = -localX * sinR + localZ * cosR;

      bale.setPosition(this.barnX - 5 + worldOffsetX, this.barnZ + worldOffsetZ);
      bale.y = this.barnY - 2 + localY;
      bale.rotation = this.barnRotation;
    } else {
      const angle = this.wagon.orientation;
      const rightX = Math.cos(angle);
      const rightZ = -Math.sin(angle);

      const offset = 3.0;
      const dropX = this.wagon.x + rightX * offset;
      const dropZ = this.wagon.z + rightZ * offset;

      bale.setPosition(dropX, dropZ);
      bale.rotation = angle;
    }
  }

  checkCollision() {
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
      return;
    }

    const wx = this.wagon.x;
    const wz = this.wagon.z;

    for (const rock of this.rockField.getCollisionObjects()) {
      const dx = wx - rock.x;
      const dz = wz - rock.z;
      const distSq = dx * dx + dz * dz;
      const radSum = this.wagonRadius + rock.radius;

      if (distSq < radSum * radSum) {
        this.wagon.takeDamage(10);
        this.collisionCooldown = 20;

        const dist = Math.sqrt(distSq);
        const overlap = radSum - dist;
        const nx = dx / dist;
        const nz = dz / dist;
        this.wagon.x += nx * overlap;
        this.wagon.z += nz * overlap;
        break;
      }
    }

    for (const horse of this.horses) {
      for (const rock of this.rockField.getCollisionObjects()) {
        const dx = horse.x - rock.x;
        const dz = horse.z - rock.z;
        const distSq = dx * dx + dz * dz;
        const radSum = this.horseRadius + rock.radius;

        if (distSq < radSum * radSum) {
          this.wagon.takeDamage(10);
          this.collisionCooldown = 20;

          const dist = Math.sqrt(distSq);
          const overlap = radSum - dist;
          const nx = dx / dist;
          const nz = dz / dist;
          this.wagon.x += nx * overlap;
          this.wagon.z += nz * overlap;
          break;
        }
      }

      const dxBarnH = horse.x - this.barnX;
      const dzBarnH = horse.z - this.barnZ;
      const distSqBarnH = dxBarnH * dxBarnH + dzBarnH * dzBarnH;
      const radSumBarnH = this.horseRadius + this.barnRadius;

      if (distSqBarnH < radSumBarnH * radSumBarnH) {
        this.wagon.takeDamage(5);
        this.collisionCooldown = 20;

        const distBarnH = Math.sqrt(distSqBarnH);
        const overlapBarnH = radSumBarnH - distBarnH;
        const nxBarnH = dxBarnH / distBarnH;
        const nzBarnH = dzBarnH / distBarnH;
        this.wagon.x += nxBarnH * overlapBarnH;
        this.wagon.z += nzBarnH * overlapBarnH;
      }

      const distWorldH = Math.sqrt(horse.x * horse.x + horse.z * horse.z);

      if (distWorldH + this.horseRadius > this.worldBoundaryRadius) {
        this.wagon.takeDamage(5);
        this.collisionCooldown = 20;

        const nxH = horse.x / distWorldH;
        const nzH = horse.z / distWorldH;
        const overlapH =
          distWorldH + this.horseRadius - this.worldBoundaryRadius;
        this.wagon.x -= nxH * overlapH;
        this.wagon.z -= nzH * overlapH;
      }
    }

    const dxBarn = wx - this.barnX;
    const dzBarn = wz - this.barnZ;
    const distSqBarn = dxBarn * dxBarn + dzBarn * dzBarn;
    const radSumBarn = this.wagonRadius + this.barnRadius;

    if (distSqBarn < radSumBarn * radSumBarn) {
      this.wagon.takeDamage(5);
      this.collisionCooldown = 20;

      const distBarn = Math.sqrt(distSqBarn);
      const overlapBarn = radSumBarn - distBarn;
      const nxBarn = dxBarn / distBarn;
      const nzBarn = dzBarn / distBarn;
      this.wagon.x += nxBarn * overlapBarn;
      this.wagon.z += nzBarn * overlapBarn;
    }

    const distWorld = Math.sqrt(wx * wx + wz * wz);

    if (distWorld + this.wagonRadius > this.worldBoundaryRadius) {
      this.wagon.takeDamage(5);
      this.collisionCooldown = 20;

      const nx = wx / distWorld;
      const nz = wz / distWorld;
      const overlap = distWorld + this.wagonRadius - this.worldBoundaryRadius;
      this.wagon.x -= nx * overlap;
      this.wagon.z -= nz * overlap;
    }
  }

  display() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();

    this.gl.disable(this.gl.CULL_FACE);

    if (this.displayAxis) this.axis.display();

    this.pushMatrix();
    this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
    this.updateSunLight();

    if (this.displaySky) {
      if (this.displayNormals) this.skyDome.enableNormalViz();
      else this.skyDome.disableNormalViz();
      this.skyDome.display();
    }

    if (this.displayClouds) {
      if (this.displayNormals) this.cloudLayer.enableNormalViz();
      else this.cloudLayer.disableNormalViz();
      this.cloudLayer.display();
    }

    if (this.displayTerrain) {
      if (this.displayNormals) this.terrain.enableNormalViz();
      else this.terrain.disableNormalViz();
      this.terrain.display();
    }

    if (this.displayDirtPatches) {
      if (this.displayNormals) this.dirtPatchLayer.enableNormalViz();
      else this.dirtPatchLayer.disableNormalViz();
      this.dirtPatchLayer.display();
    }

    if (this.displayWagonPath) {
      if (this.displayNormals) this.wagonPath.enableNormalViz();
      else this.wagonPath.disableNormalViz();
      this.wagonPath.display();
    }

    if (this.displayRocks) {
      if (this.displayNormals) this.rockField.enableNormalViz();
      else this.rockField.disableNormalViz();
      this.rockField.display();
    }

    if (this.displayFlowers) {
      this.flowerField.display();
    }

    if (this.displayBaleArea) {
      this.pushMatrix();
      this.translate(this.barnX, this.barnY - 2, this.barnZ);
      this.rotate(-Math.PI / 2, 1, 0, 0);
      this.scale(this.baleAreaRadius, this.baleAreaRadius, this.baleAreaHeight);
      this.setActiveShader(this.baleAreaShader);
      this.baleAreaShader.setUniformsValues({
        uBaseColor: this.wagonIntersecting
          ? this.baleAreaActiveColor
          : this.baleAreaNormalColor,
      });
      this.baleArea.display();
      this.setActiveShader(this.defaultShader);
      this.popMatrix();
    }

    if (this.displayBarn) {
      this.pushMatrix();
      this.translate(this.barnX - 5, this.barnY - 2, this.barnZ);
      this.scale(2.5, 2.5, 2.5);
      this.rotate(this.barnRotation, 0, 1, 0);
      this.barn.display();
      this.popMatrix();
    }

    if (this.displayWagon) {
      this.wagon.display();
    }

    if (this.displayHorse) {
      for (const horse of this.horses) {
        if (this.displayNormals) horse.enableNormalViz();
        else horse.disableNormalViz();
        horse.display();
      }
    }

    if (this.displaySun) {
      if (this.displayNormals) this.sun.enableNormalViz();
      else this.sun.disableNormalViz();
      this.sun.display();
    }

    if (this.displayGrass) {
      if (this.displayNormals) this.grassField.enableNormalViz();
      else this.grassField.disableNormalViz();
      this.grassField.display(this.time);
    }

    if (this.displayHayBales) {
      for (const bale of this.hayBales) {
        bale.display();
      }
    }

    this.popMatrix();
  }
}
