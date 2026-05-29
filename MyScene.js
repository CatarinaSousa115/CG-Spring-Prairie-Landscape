import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance } from "../lib/CGF.js";
import { Wagon } from "./objects/wagon/Wagon.js";
import { Horse } from "./objects/horse/Horse.js";
import { ObjModel } from "./models/ObjModel.js";
import { MyUIManager } from "./managers/UIManager.js";
import { MyCameraManager } from "./managers/CameraManager.js";
import { BaleManager } from "./managers/BaleManager.js";
import { CollisionManager } from "./managers/CollisionManager.js";
import { GameStateManager } from "./managers/GameStateManager.js";
import { EnvironmentManager } from "./managers/EnvironmentManager.js";
import { BarnManager } from "./managers/BarnManager.js";

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
    
    // Managers
    this.environmentManager = new EnvironmentManager(this);
    this.barnManager = new BarnManager(this);
    
    this.wagon = new Wagon(this, this.environmentManager.terrain);
    this.wagon.x = 0;
    this.wagon.z = 0;

    this.horseModel = new ObjModel(this, "models/horse/horse.obj");
    this.horseTexture = new CGFtexture(this, "models/horse/Horse_v01.jpg");
    this.horses = [
      new Horse(this, this.environmentManager.terrain, {
        model: this.horseModel,
        texture: this.horseTexture,
        lateralOffset: -0.95,
      }),
      new Horse(this, this.environmentManager.terrain, {
        model: this.horseModel,
        texture: this.horseTexture,
        lateralOffset: 0.95,
      }),
    ];

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

    // Managers
    this.cameraManager = new MyCameraManager(this);
    this.uiManager = new MyUIManager(this);
    this.collisionManager = new CollisionManager(this);
    this.baleManager = new BaleManager(this);
    this.baleManager.init();
    this.gameStateManager = new GameStateManager(this);
  }

  initLights() {
    this.setGlobalAmbientLight(0.18, 0.2, 0.16, 1.0);

    this.lights[0].setAmbient(0.18, 0.16, 0.12, 1.0);
    this.lights[0].setDiffuse(1.0, 0.92, 0.72, 1.0);
    this.lights[0].setSpecular(0.6, 0.52, 0.38, 1.0);
    this.lights[0].enable();
    this.lights[0].setVisible(true);
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
    if (this.wagon) {
      const hpPercent = (this.wagon.hp / this.wagon.maxHP) * 100;
      this.uiManager.updateHP(hpPercent);
    }

    this.uiManager.updateStats(this.deliveryProgress, this.gameTime);

    this.gameStateManager.update(t);
    if (this.gameStatus !== "playing") return;

    this.environmentManager.update(t);

    if (this.wagon) {
      this.wagon.update(t);
      this.collisionManager.update(t);
      this.baleManager.update(t);

      this.checkKeys();
    }

    if (this.horses && this.wagon) {
      for (const horse of this.horses) {
        horse.followWagon(this.wagon);
      }
    }

    this.cameraManager.update();
  }

  restartGame() {
    this.gameStateManager.restartGame();
  }

  spawnHPPopup(amount, type) {
    this.uiManager.spawnHPPopup(amount, type);
  }

  checkKeys() {
    const pPressed = this.gui.isKeyPressed("KeyP");
    if (pPressed && !this.lastPPressed) {
      this.baleManager.pickUpBale();
    }
    this.lastPPressed = pPressed;

    const lPressed = this.gui.isKeyPressed("KeyL");
    if (lPressed && !this.lastLPressed) {
      this.baleManager.dropBale();
    }
    this.lastLPressed = lPressed;

    const cPressed = this.gui.isKeyPressed("KeyC");
    if (cPressed && !this.lastCPressed) {
      this.cameraManager.nextCamera();
    }
    this.lastCPressed = cPressed;
  }

  get deliveryProgress() {
    return this.baleManager.deliveryProgress;
  }
  set deliveryProgress(val) { }

  get isWon() {
    return this.gameStateManager.isWon;
  }
  set isWon(val) { }

  get gameTime() {
    return this.gameStateManager.gameTime;
  }
  set gameTime(val) { }

  get gameStatus() {
    return this.gameStateManager.gameStatus;
  }
  set gameStatus(val) {
    if (this.gameStateManager) this.gameStateManager.gameStatus = val;
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
    
    this.environmentManager.display();

    this.baleManager.display();

    this.barnManager.display();

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

    this.popMatrix();
  }

  get time() {
    return this.gameStateManager ? this.gameStateManager.time : 0;
  }

  get skyDome() { return this.environmentManager.skyDome; }
  get terrain() { return this.environmentManager.terrain; }
  get wagonPath() { return this.environmentManager.wagonPath; }
  get rockField() { return this.environmentManager.rockField; }

  get barnX() { return this.barnManager.x; }
  get barnY() { return this.barnManager.y; }
  get barnZ() { return this.barnManager.z; }
  get barnRotation() { return this.barnManager.rotation; }
}
