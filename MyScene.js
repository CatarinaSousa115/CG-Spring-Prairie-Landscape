import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance } from "../lib/CGF.js";
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
import { Circle } from "./primitives/Circle.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }

  init(application) {
    super.init(application);
    this.enableTextures(true);

    this.initCameras();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

    // --- Dynamic Path-Relative Placement Architecture ---
    const tBarn = 0.68; 
    const p0 = this.wagonPath.getPoint(tBarn);
    const p1 = this.wagonPath.getPoint(tBarn + 0.01);

    const tangentX = p1[0] - p0[0];
    const tangentZ = p1[1] - p0[1];
    const pathSegmentLength = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ);

    const normalX = -tangentZ / pathSegmentLength;
    const normalZ = tangentX / pathSegmentLength;

    // Position Barn safely outside path width boundaries and snap to ground elevation
    const barnSideOffset = 9.5; 
    this.barnX = p0[0] + normalX * barnSideOffset;
    this.barnZ = p0[1] + normalZ * barnSideOffset;
    this.barnY = this.terrain.getHeightAt(this.barnX, this.barnZ); // Fixed: dynamic ground clamp

    // Orient the barn around the Y axis to face straight back towards the trail
    this.barnRotation = Math.atan2(-normalX, -normalZ);

    // Position interactive Bale zone and calculate its height relative to hills
    const baleSideOffset = 4.5;
    this.baleAreaX = p0[0] + normalX * baleSideOffset;
    this.baleAreaZ = p0[1] + normalZ * baleSideOffset;
    this.baleAreaY = this.terrain.getHeightAt(this.baleAreaX, this.baleAreaZ) + 0.02; // Fixed: ground clamp + layout bias
    
    this.baleAreaRadius = 3.5;
    this.wagonRadius = 1.8;
    this.wagonIntersecting = false;

    this.barnWallTexture = new CGFtexture(this, "textures/barn_wall.png");
    this.barnRoofTexture = new CGFtexture(this, "textures/barn_roof.png");
    this.barnDoorTexture = new CGFtexture(this, "textures/barn_door.png");
    this.barnWindowTexture = new CGFtexture(this, "textures/barn_window.png");
    this.baleNormalTex = new CGFtexture(this, "textures/dirt_patch_2.png");
    this.baleActiveTex = new CGFtexture(this, "textures/meadow.png");

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
    this.baleNormalMat.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.baleNormalMat.setDiffuse(0.6, 0.6, 0.6, 1.0);
    this.baleNormalMat.setTexture(this.baleNormalTex);

    this.baleActiveMat = new CGFappearance(this);
    this.baleActiveMat.setAmbient(0.3, 0.8, 0.4, 1.0); 
    this.baleActiveMat.setDiffuse(0.4, 0.9, 0.5, 1.0);
    this.baleActiveMat.setTexture(this.baleActiveTex);

    this.barn = new Barn(
      this,
      this.barnWallMaterial,
      this.barnRoofMaterial,
      this.barnDoorMaterial,
      this.barnWindowMaterial,
    );
    this.baleArea = new Circle(this, 40);

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

    this.sunLightEnabled = true;
    this.scaleFactor = 2.0;
    this.sunAngle = 0;
    this.time = 0;
    this.startTime = undefined;

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
    if (this.startTime === undefined) this.startTime = t;

    this.time = (t - this.startTime) * 0.001;

    this.cloudLayer.update(t);

    if (this.wagon) {
      this.wagon.update(t);

      const dx = this.wagon.x - this.baleAreaX;
      const dz = this.wagon.z - this.baleAreaZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      this.wagonIntersecting =
        distance < this.baleAreaRadius + this.wagonRadius;
    }

    if (this.horses && this.wagon) {
      for (const horse of this.horses) {
        horse.followWagon(this.wagon);
      }
    }

    if (this.wagonPath.width !== this.lastPathWidth) {
      this.lastPathWidth = this.wagonPath.width;
      this.grassField.rebuild();
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
      this.translate(this.baleAreaX, this.baleAreaY, this.baleAreaZ); // Fixed: maps precisely over hill contours
      this.scale(this.baleAreaRadius, 1, this.baleAreaRadius);
      if (this.wagonIntersecting) {
        this.baleActiveMat.apply();
      } else {
        this.baleNormalMat.apply();
      }
      this.baleArea.display();
      this.popMatrix();
    }

    if (this.displayBarn) {
      this.pushMatrix();
      this.translate(this.barnX, this.barnY, this.barnZ); // Fixed: barn base stays aligned with terrain surface
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

    this.popMatrix();
  }
}