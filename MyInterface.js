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

        this.createGameFolder();

        this.initKeys();
        return true;
    }
    
    /*  
        • Smooth keyboard control (W, A, S, D + P, L):
        • W accelerates forward (up to horse walk speed)
        • A steers front wheels left
        • D steers front wheels right
        • S reduces speed
        • P for hale pick-up
        • L for hale drop
    */

    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    }

    processKeyUp(event) {
            this.activeKeys[event.code]=false;

    }

    isKeyPressed(keyCode) {
            return this.activeKeys[keyCode] || false;

    }

    createGameFolder() { 
        const gameFolder = this.gui.addFolder("game");
        gameFolder.add(this.scene.wagon, 'hp', 0, 100).name('Health').listen();
        gameFolder.add(this.scene, 'deliveryProgress').name('Bales delivered').listen();
        gameFolder.add(this.scene, 'gameTime').name('Time').listen();

        gameFolder.open();
    }
}
