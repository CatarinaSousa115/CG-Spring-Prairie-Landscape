import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { SkyDome } from "./world/SkyDome.js";
import { PrairieTerrain } from "./world/PrairieTerrain.js";
import {Sun} from "./world/Sun.js"
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
        this.initLights();

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
            height: 0,
            followCamera: false
        });

        this.sun = new Sun(this,{
            radius: 300
        })

        this.displayAxis = true;
        this.displaySky = true;
        this.displayTerrain = true;
        this.displayNormals = false;
        this.displaySun = true;
        this.scaleFactor = 2.0;
        this.sunAngle = 0;
    }

    initLights() {
        this.setGlobalAmbientLight(0.3, 0.3, 0.3, 1.0);

        this.lights[0].setPosition(2.0, 2.0, -1.0, 1.0);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
        this.lights[0].enable();
        this.lights[0].setVisible(true);
        this.lights[0].update();

        this.lights[1].setPosition(0.0, -1.0, 2.0, 1.0);
        this.lights[1].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[1].setSpecular(1.0, 1.0, 0.0, 1.0);
        this.lights[1].enable();
        this.lights[1].setVisible(true);
        this.lights[1].update();
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

    display() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.updateProjectionMatrix();
        this.loadIdentity();
        this.applyViewMatrix();

        this.gl.disable(this.gl.CULL_FACE);

        this.lights[0].update();
        this.lights[1].update();

        if (this.displayAxis) this.axis.display();

        this.pushMatrix();
        this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

        if (this.displaySky) {
            if (this.displayNormals) this.skyDome.enableNormalViz();
            else this.skyDome.disableNormalViz();

            this.skyDome.display();
        }

        if (this.displayTerrain) {
            this.terrain.display();
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
        this.popMatrix();
}

}
