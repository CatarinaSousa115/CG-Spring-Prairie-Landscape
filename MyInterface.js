import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);

        this.gui = new dat.GUI();
        this.gui.width = 320;

        this.createSceneFolder();
        this.createSkyFolder();
        this.createCloudFolder();
        this.createWorldFolder();
        this.createScatterFolder();
        this.createGameplayFolder();
        this.createSunFolder();
        this.createGrassFolder();
        return true;
    }

    createSceneFolder() {
        const sceneFolder = this.gui.addFolder('Scene');
        sceneFolder.add(this.scene, 'displayAxis').name('Show axis');
        sceneFolder.add(this.scene, 'displayNormals').name('Show normals');
        sceneFolder.add(this.scene, 'scaleFactor', 0.1, 10.0).name('Scene scale');
        sceneFolder.open();
    }

    createSkyFolder() {
        const skyFolder = this.gui.addFolder('Sky');
        skyFolder.add(this.scene, 'displaySky').name('Show sky');
        skyFolder.add(this.scene.skyDome, 'followCamera').name('Follow camera');
        skyFolder.add(this.scene.skyDome, 'radius', 20, 300, 1).name('Radius');
        skyFolder.open();
    }

    createCloudFolder() {
        const cloudFolder = this.gui.addFolder('Clouds');
        cloudFolder.add(this.scene, 'displayClouds').name('Show clouds');
        cloudFolder.add(this.scene.cloudLayer, 'followCamera').name('Follow camera');
        cloudFolder.add(this.scene.cloudLayer, 'animated').name('Animate');
        cloudFolder.add(this.scene.cloudLayer, 'orbitRadius', 20, 120, 1).name('Orbit radius');
        cloudFolder.add(this.scene.cloudLayer, 'height', 5, 95, 1).name('Height');
        cloudFolder.add(this.scene.cloudLayer, 'speed', -0.15, 0.15, 0.005).name('Wind speed');
        cloudFolder.add(this.scene.cloudLayer, 'brightness', 0, 1, 0.01).name('Brightness');
        cloudFolder.open();
    }

    createGrassFolder()
    {
        const grassFolder = this.gui.addFolder('Grass');
        grassFolder.add(this.scene,'displayGrass').name('Show Grass');
        grassFolder.open();
    }

    createSunFolder() {
        const sunFolder = this.gui.addFolder('Sun');
        sunFolder.add(this.scene, 'displaySun').name('Show sun');
        sunFolder.add(this.scene, 'sunLightEnabled').name('Sun light');
        sunFolder.add(this.scene, 'sunAngle', -Math.PI, Math.PI, 0.01).name('Sun angle');
        sunFolder.add(this.scene.sun, 'followCamera').name('Follow camera');
        sunFolder.add(this.scene.sun, 'orbitRadius', 20, 300, 1).name('Orbit radius');
        sunFolder.add(this.scene.sun, 'height', 5, 120, 1).name('Height');
        sunFolder.add(this.scene.sun, 'heightVariation', 0, 60, 1).name('Height variation');
        sunFolder.add(this.scene.sun, 'sunSize', 1, 50, 1).name('Sun size');
        sunFolder.open();
    }

    createWorldFolder() {
        const worldFolder = this.gui.addFolder('World');
        worldFolder.add(this.scene, 'displayTerrain').name('Show terrain');
        worldFolder.add(this.scene, 'displayDirtPatches').name('Show dirt patches');
        worldFolder.add(this.scene, 'displayWagonPath').name('Show wagon path');
        worldFolder.add(this.scene.terrain, 'followCamera').name('Terrain follows sky');
        worldFolder
            .add(this.scene.terrain, 'radius', 10, 300, 1)
            .name('Terrain radius')
            .onChange((value) => this.scene.terrain.setRadius(value));
        worldFolder
            .add(this.scene.terrain, 'height', -10, 10, 0.1)
            .name('Terrain height')
            .onChange((value) => this.scene.terrain.setHeight(value));
        worldFolder
            .add(this.scene.terrain, 'elevation', 0, 12, 0.1)
            .name('Hill height')
            .onChange((value) => this.scene.terrain.setElevation(value));
        worldFolder
            .add(this.scene.terrain, 'hillScale', 0.2, 2.5, 0.05)
            .name('Hill scale')
            .onChange((value) => this.scene.terrain.setHillScale(value));
        worldFolder
            .add(this.scene.terrain, 'subdivisions', 1, 100, 1)
            .name('Terrain detail')
            .onChange((value) => this.scene.terrain.setSubdivisions(value));
        worldFolder
            .add(this.scene.dirtPatchLayer, 'patchScale', 0.4, 2.2, 0.05)
            .name('Dirt patch scale');
        worldFolder
            .add(this.scene.wagonPath, 'width', 2, 14, 0.2)
            .name('Path width');
        worldFolder.close();
    }

    createGameplayFolder() {
        const gameplayFolder = this.gui.addFolder('Gameplay');
        gameplayFolder.close();
    }

    createScatterFolder() {
        const scatterFolder = this.gui.addFolder('Scatter');
        scatterFolder.add(this.scene, 'displayRocks').name('Show rocks');
        scatterFolder
            .add(this.scene.rockField, 'rockScale', 0.4, 2.5, 0.05)
            .name('Rock scale');
        scatterFolder.close();
    }
}
