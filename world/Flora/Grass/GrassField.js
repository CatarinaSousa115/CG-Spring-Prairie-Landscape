import { CGFobject, CGFappearance, CGFshader } from "../../../../lib/CGF.js";
import { GrassBlade } from "../../../primitives/GrassBlade.js";

export class GrassField extends CGFobject {
    constructor(scene, options = {}) {
        super(scene);

        this.blade = new GrassBlade(scene);
        this.terrain = options.terrain ?? null;
        this.wagonPath = options.wagonPath ?? null;
        this.rockField = options.rockField ?? null;
        this.dirtLayer = options.dirtLayer ?? null;
        this.numBlades = options.numBlades ?? 8000;
        this.areaRadius = options.areaRadius ?? 70;
        this.pathMargin = options.pathMargin ?? null;
        this.rockMargin = options.rockMargin ?? 2.0;
        this.dirtMargin = options.dirtMargin ?? 1.5;
        this.deadRatio = options.deadRatio ?? 0.3;

        this.windSpeed = options.windSpeed ?? 1.2;
        this.windStrength = options.windStrength ?? 0.18;

        this.grassShader = new CGFshader(
            scene.gl,
            "shaders/grass.vert",
            "shaders/grass.frag",
        );

        this.greenColor = [0.15, 0.55, 0.1, 1.0];
        this.deadColor = [0.6, 0.5, 0.1, 1.0];

        this.blades = [];
        this.rebuild();
    }

    rebuild() {
        this.blades = [];

        const pathMargin =
        this.pathMargin !== null
            ? this.pathMargin
            : this.wagonPath
            ? this.wagonPath.width / 2 + 1.0
            : 0;

        const terrainRadius = this.terrain ? this.terrain.radius : this.areaRadius;
        const edgeLimit     = terrainRadius;

        const maxAttempts = this.numBlades * 20;
        let attempts = 0;

        while (this.blades.length < this.numBlades && attempts < maxAttempts) {
        attempts++;

        const x = (Math.random() - 0.5) * this.areaRadius * 2;
        const z = (Math.random() - 0.5) * this.areaRadius * 2;

        if (x * x + z * z > this.areaRadius * this.areaRadius) 
            continue;

        if (x * x + z * z > edgeLimit * edgeLimit) 
            continue;

        if (this.wagonPath && this.wagonPath.isNearPath(x, z, pathMargin))
            continue;
        if (this.rockField && this.rockField.isNearRock(x, z, this.rockMargin))
            continue;
        if (this.dirtLayer && this.dirtLayer.isNearDirt(x, z, this.dirtMargin))
            continue;

        this.blades.push({
            x,
            z,
            rotY: Math.random() * Math.PI,
            height: 0.3 + Math.random() * 0.5,
            dead: Math.random() < this.deadRatio,
            phase: Math.random() * Math.PI * 2,
        });
        }
    }

    display(t = 0) {
        this.scene.setActiveShader(this.grassShader);

        this.grassShader.setUniformsValues({
        uTime: t,
        uWindSpeed: this.windSpeed,
        uWindStrength: this.windStrength,
        });

        for (const b of this.blades) {
        const y = this.terrain ? this.terrain.getHeightAt(b.x, b.z) : 0;

        this.grassShader.setUniformsValues({
            uBaseColor: b.dead ? this.deadColor : this.greenColor,
            uPhase: b.phase,
        });

        this.scene.pushMatrix();
        this.scene.translate(b.x, y, b.z);
        this.scene.rotate(b.rotY, 0, 1, 0);
        this.scene.scale(1, b.height, 1);
        this.blade.display();
        this.scene.popMatrix();
        }

        this.scene.setActiveShader(this.scene.defaultShader);
    }

    enableNormalViz() {
        this.blade.enableNormalViz();
    }
    disableNormalViz() {
        this.blade.disableNormalViz();
    }
}
