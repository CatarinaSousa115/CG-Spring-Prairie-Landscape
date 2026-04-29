import { CGFappearance } from "../../lib/CGF.js";
import { Sphere } from "../primitives/Sphere.js";

export class CloudLayer {
    constructor(scene, options = {}) {
        this.scene = scene;

        this.visible = options.visible ?? true;
        this.followCamera = options.followCamera ?? false;
        this.animated = options.animated ?? true;
        this.orbitRadius = options.orbitRadius ?? 72;
        this.height = options.height ?? 55;
        this.speed = options.speed ?? 0.025;
        this.brightness = options.brightness ?? 0.72;
        this.time = 0;

        this.geometry = new Sphere(scene, options.slices ?? 16, options.stacks ?? 8, 1);
        this.clouds = this.createClouds();

        this.appearance = new CGFappearance(scene);
        this.updateAppearance();
    }

    updateAppearance() {
        const b = this.brightness;

        this.appearance.setAmbient(0.75 + 0.2 * b, 0.78 + 0.18 * b, 0.8 + 0.16 * b, 1);
        this.appearance.setDiffuse(0.35, 0.36, 0.34, 1);
        this.appearance.setSpecular(0.04, 0.04, 0.04, 1);
        this.appearance.setEmission(0.45 * b, 0.48 * b, 0.52 * b, 1);
        this.appearance.setShininess(4);
    }

    createClouds() {
        return [
            {
                angle: -2.55,
                radiusOffset: -4,
                heightOffset: 7,
                scale: 1.15,
                puffs: [
                    [-2.8, 0.0, 0.0, 2.2, 0.7, 1.0],
                    [-1.0, 0.3, 0.2, 2.8, 1.0, 1.2],
                    [1.2, 0.1, 0.0, 2.4, 0.8, 1.0],
                    [2.8, -0.1, 0.2, 1.8, 0.6, 0.8]
                ]
            },
            {
                angle: -1.15,
                radiusOffset: 2,
                heightOffset: 12,
                scale: 0.95,
                puffs: [
                    [-2.0, 0.0, 0.0, 1.8, 0.6, 0.9],
                    [-0.4, 0.3, 0.1, 2.5, 0.9, 1.1],
                    [1.6, 0.1, 0.0, 2.0, 0.7, 0.9]
                ]
            },
            {
                angle: 0.35,
                radiusOffset: -8,
                heightOffset: 4,
                scale: 1.25,
                puffs: [
                    [-3.4, -0.1, 0.0, 2.4, 0.7, 0.9],
                    [-1.5, 0.2, 0.1, 2.9, 1.0, 1.1],
                    [0.8, 0.3, 0.0, 2.7, 0.9, 1.2],
                    [3.0, 0.0, 0.1, 2.0, 0.6, 0.8]
                ]
            },
            {
                angle: 1.65,
                radiusOffset: 1,
                heightOffset: 10,
                scale: 0.8,
                puffs: [
                    [-1.8, 0.0, 0.0, 1.8, 0.5, 0.8],
                    [-0.2, 0.2, 0.1, 2.1, 0.7, 0.9],
                    [1.5, 0.0, 0.0, 1.6, 0.5, 0.7]
                ]
            },
            {
                angle: 2.55,
                radiusOffset: -5,
                heightOffset: 15,
                scale: 1.05,
                puffs: [
                    [-2.4, 0.0, 0.0, 2.0, 0.6, 0.9],
                    [-0.7, 0.4, 0.1, 2.6, 0.8, 1.1],
                    [1.5, 0.1, 0.0, 2.3, 0.7, 0.9]
                ]
            }
        ];
    }

    update(t) {
        this.time = t / 1000;
    }

    display() {
        if (!this.visible) return;

        this.updateAppearance();
        this.appearance.apply();

        this.scene.pushMatrix();
        if (this.followCamera) {
            const cameraPosition = this.scene.camera.position;
            this.scene.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        }

        for (const cloud of this.clouds) {
            this.displayCloud(cloud);
        }

        this.scene.popMatrix();
    }

    displayCloud(cloud) {
        const drift = this.animated ? this.time * this.speed : 0;
        const angle = cloud.angle + drift;
        const distance = this.orbitRadius + cloud.radiusOffset;
        const x = distance * Math.cos(angle);
        const z = distance * Math.sin(angle);
        const y = this.height + cloud.heightOffset;

        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.rotate(-angle + Math.PI / 2, 0, 1, 0);
        this.scene.scale(cloud.scale, cloud.scale, cloud.scale);

        for (const puff of cloud.puffs) {
            this.displayPuff(puff);
        }

        this.scene.popMatrix();
    }

    displayPuff(puff) {
        const [x, y, z, sx, sy, sz] = puff;

        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.scale(sx, sy, sz);
        this.geometry.display();
        this.scene.popMatrix();
    }

    enableNormalViz() {
        this.geometry.enableNormalViz();
    }

    disableNormalViz() {
        this.geometry.disableNormalViz();
    }
}
