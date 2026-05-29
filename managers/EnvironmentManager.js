import { CGFtexture } from "../../lib/CGF.js";
import { SkyDome } from "../world/SkyDome.js";
import { PrairieTerrain } from "../world/PrairieTerrain.js";
import { Sun } from "../world/Sun.js";
import { CloudLayer } from "../world/CloudLayer.js";
import { DirtPatchLayer } from "../world/DirtPatchLayer.js";
import { WagonPath } from "../world/WagonPath.js";
import { RockField } from "../world/rocks/RockField.js";
import { GrassField } from "../world/flora/grass/GrassField.js";
import { FlowerField } from "../world/flora/flowers/FlowerField.js";

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    this.skyDome = new SkyDome(this.scene, {
      radius: 100,
      slices: 48,
      stacks: 24,
      followCamera: false,
    });

    this.terrain = new PrairieTerrain(this.scene, {
      radius: this.skyDome.radius,
      subdivisions: 40,
      elevation: 3.2,
      hillScale: 0.85,
      height: 0,
      followCamera: false,
      texturePath: "textures/prairie.png",
      textureTiling: 25,
    });

    this.sun = new Sun(this.scene, {
      radius: 82,
      sunSize: 7,
    });

    this.cloudLayer = new CloudLayer(this.scene, {
      orbitRadius: 72,
      height: 15,
      brightness: 0.72,
      followCamera: false,
    });

    this.dirtPatchLayer = new DirtPatchLayer(this.scene, this.terrain);
    this.wagonPath = new WagonPath(this.scene, this.terrain);
    this.rockField = new RockField(this.scene, this.terrain);

    this.grassField = new GrassField(this.scene, {
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

    this.flowerField = new FlowerField(
      this.scene,
      350,
      100,
      this.terrain,
      this.wagonPath,
      0,
      0
    );

    this.lastPathWidth = this.wagonPath.width;
  }

  update(t) {
    this.cloudLayer.update(t);

    if (this.wagonPath.width !== this.lastPathWidth) {
      this.lastPathWidth = this.wagonPath.width;
      this.grassField.rebuild();
    }

    this.updateSunLight();
  }

  updateSunLight() {
    if (!this.scene.sunLightEnabled) {
      this.scene.lights[0].disable();
      this.scene.lights[0].update();
      return;
    }

    const sunPosition = this.sun.getScenePosition();

    this.scene.lights[0].enable();
    this.scene.lights[0].setPosition(
      sunPosition[0],
      sunPosition[1],
      sunPosition[2],
      1.0
    );
    this.scene.lights[0].update();
  }

  display() {
    if (this.scene.displaySky) {
      if (this.scene.displayNormals) this.skyDome.enableNormalViz();
      else this.skyDome.disableNormalViz();
      this.skyDome.display();
    }

    if (this.scene.displayClouds) {
      if (this.scene.displayNormals) this.cloudLayer.enableNormalViz();
      else this.cloudLayer.disableNormalViz();
      this.cloudLayer.display();
    }

    if (this.scene.displayTerrain) {
      if (this.scene.displayNormals) this.terrain.enableNormalViz();
      else this.terrain.disableNormalViz();
      this.terrain.display();
    }

    if (this.scene.displayDirtPatches) {
      if (this.scene.displayNormals) this.dirtPatchLayer.enableNormalViz();
      else this.dirtPatchLayer.disableNormalViz();
      this.dirtPatchLayer.display();
    }

    if (this.scene.displayWagonPath) {
      if (this.scene.displayNormals) this.wagonPath.enableNormalViz();
      else this.wagonPath.disableNormalViz();
      this.wagonPath.display();
    }

    if (this.scene.displayRocks) {
      if (this.scene.displayNormals) this.rockField.enableNormalViz();
      else this.rockField.disableNormalViz();
      this.rockField.display();
    }

    if (this.scene.displayFlowers) {
      this.flowerField.display();
    }

    if (this.scene.displaySun) {
      if (this.scene.displayNormals) this.sun.enableNormalViz();
      else this.sun.disableNormalViz();
      this.sun.display();
    }

    if (this.scene.displayGrass) {
      if (this.scene.displayNormals) this.grassField.enableNormalViz();
      else this.grassField.disableNormalViz();
      this.grassField.display(this.scene.time);
    }
  }
}
