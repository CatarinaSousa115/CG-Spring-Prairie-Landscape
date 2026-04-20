import { CGFscene, CGFcamera, CGFaxis, CGFappearance } from "../lib/CGF.js";
import { SemiSphere } from "./sky/SemiSphere.js";

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

        this.initCameras();
        this.initLights();
        this.initMaterials();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.semisphere = new SemiSphere(this, 16, 8);

        this.displayAxis = true;
        this.displayNormals = false;
        this.scaleFactor = 2.0;
        this.selectedMaterial = 0;
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

    hexToRgbA(hex) {
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            return [
                parseInt(hex.substring(1, 3), 16) / 255.0,
                parseInt(hex.substring(3, 5), 16) / 255.0,
                parseInt(hex.substring(5, 7), 16) / 255.0,
                1.0
            ];
        }

        return [
            hex[0] / 255.0,
            hex[1] / 255.0,
            hex[2] / 255.0,
            1.0
        ];
    }

    updateCustomMaterial() {
        this.customMaterial.setAmbient(...this.hexToRgbA(this.customMaterialValues['Ambient']));
        this.customMaterial.setDiffuse(...this.hexToRgbA(this.customMaterialValues['Diffuse']));
        this.customMaterial.setSpecular(...this.hexToRgbA(this.customMaterialValues['Specular']));
        this.customMaterial.setShininess(this.customMaterialValues['Shininess']);
    }

    initMaterials() {
        this.material1 = new CGFappearance(this);
        this.material1.setAmbient(0, 0, 1, 1.0);
        this.material1.setDiffuse(0, 0, 0, 1.0);
        this.material1.setSpecular(0, 0, 0, 1.0);
        this.material1.setShininess(10.0);

        this.skyMaterial = new CGFappearance(this);
        this.skyMaterial.setAmbient(0.2, 0.4, 0.9, 1);
        this.skyMaterial.setDiffuse(0.2, 0.4, 0.9, 1);
        this.skyMaterial.setSpecular(0, 0, 0, 1);
        this.skyMaterial.setShininess(1);

        this.customMaterialValues = {
            'Ambient': '#0000ff',
            'Diffuse': '#ff0000',
            'Specular': '#000000',
            'Shininess': 10
        };

        this.customMaterial = new CGFappearance(this);
        this.updateCustomMaterial();

        this.materials = [
            this.material1,
            this.skyMaterial,
            this.customMaterial
        ];

        this.materialIDs = {
            'Ambient': 0,
            'Sky material': 1,
            'Custom material': 2
        };
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

        this.materials[this.selectedMaterial].apply();

        this.pushMatrix();
        this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

        if (this.displayNormals) this.semisphere.enableNormalViz();
        else this.semisphere.disableNormalViz();

        this.pushMatrix();

        this.scale(10, 10, 10);
        this.rotate(-Math.PI / 2, 1, 0, 0);
        this.skyMaterial.apply();
        this.semisphere.display();

        this.popMatrix();

        this.popMatrix();
    }
}