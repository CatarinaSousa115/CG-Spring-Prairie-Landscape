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
        this.createWorldFolder();
        this.createGameplayFolder();
        this.createSunFolder();
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

    createSunFolder()
    {
        const sunFolder = this.gui.addFolder('Sun');
        sunFolder.add(this.scene,'displaySun').name('Show sun');
        sunFolder.add(this.scene.sun,'followCamera').name('Follow Camera');
		sunFolder.add(this.scene.sun, 'orbitRadius', 20, 300, 1).name('Orbit Radius');
		sunFolder.add(this.scene.sun, 'sunSize', 1, 50, 1).name('Sun Size');
		sunFolder.open();
	}

    createWorldFolder() {
        const worldFolder = this.gui.addFolder('World');
        worldFolder.add(this.scene, 'displayTerrain').name('Show terrain');
        worldFolder.add(this.scene.terrain, 'followCamera').name('Terrain follows sky');
        worldFolder.add(this.scene.terrain, 'radius', 10, 300, 1).name('Terrain radius');
        worldFolder.add(this.scene.terrain, 'height', -10, 10, 0.1).name('Terrain height');
        worldFolder
            .add(this.scene.terrain, 'subdivisions', 1, 100, 1)
            .name('Terrain detail')
            .onChange((value) => this.scene.terrain.setSubdivisions(value));
        worldFolder.close();
    }

    createGameplayFolder() {
        const gameplayFolder = this.gui.addFolder('Gameplay');
        gameplayFolder.close();
    }
}
