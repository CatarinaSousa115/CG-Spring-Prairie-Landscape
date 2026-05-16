import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { SkyDome } from "./world/SkyDome.js";
import { PrairieTerrain } from "./world/PrairieTerrain.js";
import { Sun } from "./world/Sun.js";
import { CloudLayer } from "./world/CloudLayer.js";
import { DirtPatchLayer } from "./world/DirtPatchLayer.js";
import { WagonPath } from "./world/WagonPath.js";
import { RockField } from "./world/RockField.js";
import { Wagon } from "./objects/wagon/Wagon.js";

import { GrassField } from "./world/Flora/Grass/GrassField.js";
import { FlowerField } from "./world/Flora/Flowers/FlowerField.js"; 

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

        this.axis = new CGFaxis(this);
        this.skyDome = new SkyDome(this, {
            radius: 100,
            slices: 48,
            stacks: 24,
            followCamera: false
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
            sunSize: 7
        });
        this.cloudLayer = new CloudLayer(this, {
            orbitRadius: 72,
            height: 15,
            brightness: 0.72,
            followCamera: false
        });

        this.dirtPatchLayer = new DirtPatchLayer(this, this.terrain);
        this.wagonPath      = new WagonPath(this, this.terrain);
        this.rockField      = new RockField(this, this.terrain);
        this.wagon          = new Wagon(this, this.terrain);
        this.wagon.x = 0;
        this.wagon.z = 0;

        this.grassField = new GrassField(this, {
            terrain:      this.terrain,
            wagonPath:    this.wagonPath,
            rockField:    this.rockField,
            dirtLayer:    this.dirtPatchLayer,
            numBlades:    12000,
            areaRadius:   100,
            deadRatio:    0.25,
            windSpeed:    1.2,
            windStrength: 0.18,
        });
        this.initLights();
        this.setUpdatePeriod(50);

        this.displayAxis        = true;
        this.displaySky         = true;
        this.displayTerrain     = true;
        this.displayNormals     = false;
        this.displaySun         = true;
        this.displayClouds      = true;
        this.displayDirtPatches = true;
        this.displayWagonPath   = true;
        this.displayRocks       = true;
        this.displayWagon       = true;
        this.displayGrass       = true;
        this.displayFlowers     = true; 
        this.sunLightEnabled    = true;
        this.scaleFactor        = 2.0;
        this.sunAngle           = 0;
        this.time               = 0;
        this.startTime          = undefined;

        this.lastPathWidth = this.wagonPath.width;

        this.flowerField = new FlowerField(this, 350, 100,        this.terrain, this.wagonPath, 0, 0)

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
            1.0
        );
        this.lights[0].update();
    }

    initCameras() {
        this.camera = new CGFcamera(
            0.6,
            0.1,
            500,
            vec3.fromValues(45, 28, 45),
            vec3.fromValues(0, 0, 0)
        );
    }

    update(t) {
        if (this.startTime === undefined) this.startTime = t;
        
        this.time = (t - this.startTime) * 0.001;
        
        this.cloudLayer.update(t);

        if (this.wagon) {
            this.wagon.update(t);
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

        if (this.displayWagon) {
            this.wagon.display();
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