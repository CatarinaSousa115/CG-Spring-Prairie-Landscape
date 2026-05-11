import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { GrassBlade } from '../primitives/GrassBlade.js';

export class GrassPatch extends CGFobject {
    constructor(scene, numBlades = 200, radius = 5, isDead = false, terrain = null, wagonPath = null, originX = 0, originZ = 0) {
        super(scene);
        this.blade = new GrassBlade(scene);
        this.isDead = isDead;
        this.terrain = terrain;
        this.wagonPath = wagonPath;
        this.numBlades = numBlades;
        this.radius = radius;
        this.originX = originX;
        this.originZ = originZ;

        this.material = new CGFappearance(scene);
        this.material.setAmbient(0.1, 0.1, 0.0, 1.0);
        this.material.setSpecular(0.0, 0.0, 0.0, 1.0);
        this.material.setShininess(5);
        if (isDead) {
            this.material.setDiffuse(0.6, 0.5, 0.1, 1.0);
        } else {
            this.material.setDiffuse(0.15, 0.55, 0.1, 1.0);
        }

        this.blades = [];
        this.rebuild();
    }

    rebuild() {
        this.blades = [];
        const pathMargin = this.wagonPath ? (this.wagonPath.width / 2) + 1.0 : 0;
        const maxAttempts = this.numBlades * 20;
        let attempts = 0;

        while (this.blades.length < this.numBlades && attempts < maxAttempts) {
            attempts++;
            const angle = Math.random() * 2 * Math.PI;
            const dist  = Math.sqrt(Math.random()) * this.radius;
            const x = dist * Math.cos(angle);
            const z = dist * Math.sin(angle);

            const worldX = this.originX + x;
            const worldZ = this.originZ + z;

            if (this.wagonPath && this.wagonPath.isNearPath(worldX, worldZ, pathMargin)) continue;

            this.blades.push({
                x, z,
                rotY:   Math.random() * Math.PI,
                height: 0.3 + Math.random() * 0.5,
            });
        }
    }

    display(patchX = 0, patchZ = 0) {
        this.material.apply();

        for (const b of this.blades) {
            const worldX = patchX + b.x;
            const worldZ = patchZ + b.z;
            const y = this.terrain ? this.terrain.getHeightAt(worldX, worldZ) : 0;

            this.scene.pushMatrix();
            this.scene.translate(b.x, y, b.z);
            this.scene.rotate(b.rotY, 0, 1, 0);
            this.scene.scale(1, b.height, 1);
            this.blade.display();
            this.scene.popMatrix();
        }
    }
}