import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { SkyDome } from "./world/SkyDome.js";
import { PrairieTerrain } from "./world/PrairieTerrain.js";
import { Sun } from "./world/Sun.js";
import { CloudLayer } from "./world/CloudLayer.js";
import { DirtPatchLayer } from "./world/DirtPatchLayer.js";
import { WagonPath } from "./world/WagonPath.js";
import { RockField } from "./world/RockField.js";
import { GrassPatch } from "./world/GrassPatch.js";
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
            followCamera: false
        });

        this.sun = new Sun(this,{
            radius: 82,
            sunSize: 7
        });
        this.cloudLayer = new CloudLayer(this, {
            orbitRadius: 72,
            height: 48,
            brightness: 0.72,
            followCamera: false
        });
        this.dirtPatchLayer = new DirtPatchLayer(this, this.terrain);
        this.wagonPath = new WagonPath(this, this.terrain);
        this.rockField = new RockField(this, this.terrain);
        this.initLights();
        this.setUpdatePeriod(50);

        this.patchConfigs = [
            // [x, z, numBlades, radius, isDead]
            [10,   5,  300, 6, false],
            [-8,  12,  250, 5, false],
            [15, -10,  280, 7, false],
            [-20,  3,  260, 6, false],
            [25,   8,  220, 5, false],
            [-5,  20,  300, 7, false],
            [30, -15,  240, 6, false],
            [-25, -8,  280, 5, false],
            [18,  22,  200, 6, false],
            [-15, 15,  260, 7, false],
            [-30, 18,  240, 6, false],
            [35,   2,  220, 5, false],
            [-10, -18, 270, 6, false],
            [20,  30,  250, 7, false],
            [-35, -12, 230, 5, false],
            // secas
            [5,  -15,  200, 4, true],
            [-12,  -5, 150, 3, true],
            [22,   -3, 180, 4, true],
            [-3,  -20, 160, 3, true],
            [8,   -25, 200, 5, true],
            [28,  -20, 170, 4, true],
            [-22, -15, 150, 3, true],
            [40,  -10, 180, 4, true],
            [-40,   5, 160, 3, true],
            [12,  -35, 190, 4, true],
        ];

        this.greenConfigs = this.patchConfigs.filter(c => !c[4]);
        this.deadConfigs  = this.patchConfigs.filter(c =>  c[4]);

        this.grassPatches     = [];
        this.deadGrassPatches = [];

        for (const [x, z, num, radius, isDead] of this.patchConfigs) {
            const patch = new GrassPatch(this, num, radius, isDead, this.terrain, this.wagonPath, x, z);
            if (isDead) this.deadGrassPatches.push(patch);
            else        this.grassPatches.push(patch);
        }

        this.displayAxis = true;
        this.displaySky = true;
        this.displayTerrain = true;
        this.displayNormals = false;
        this.displaySun = true;
        this.displayClouds = true;
        this.displayDirtPatches = true;
        this.displayWagonPath = true;
        this.displayRocks = true;
        this.sunLightEnabled = true;
        this.scaleFactor = 2.0;
        this.sunAngle = 0;

        this.lastPathWidth = this.wagonPath.width;
    }

    rebuildGrass() {
        for (const patch of this.grassPatches)     patch.rebuild();
        for (const patch of this.deadGrassPatches) patch.rebuild();
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
            0.4,
            0.1,
            500,
            vec3.fromValues(10, 10, 10),
            vec3.fromValues(0, 0, 0)
        );
    }

    update(t) {
        this.cloudLayer.update(t);

        if (this.wagonPath.width !== this.lastPathWidth) {
            this.lastPathWidth = this.wagonPath.width;
            this.rebuildGrass();
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

        if (this.displaySun) {
            if (this.displayNormals) 
            {
                this.sun.enableNormalViz();
            }
            else 
            {
                this.sun.disableNormalViz();
            }

            this.sun.display();
        }    


        for (let i = 0; i < this.grassPatches.length; i++) {
            const [px, pz] = [this.greenConfigs[i][0], this.greenConfigs[i][1]];
            this.pushMatrix();
            this.translate(px, 0, pz);
            this.grassPatches[i].display(px, pz);
            this.popMatrix();
        }


        for (let i = 0; i < this.deadGrassPatches.length; i++) {
            const [px, pz] = [this.deadConfigs[i][0], this.deadConfigs[i][1]];
            this.pushMatrix();
            this.translate(px, 0, pz);
            this.deadGrassPatches[i].display(px, pz);
            this.popMatrix();
        }

        this.popMatrix();
    }
}