import { CGFobject, CGFshader } from "../../../lib/CGF.js";
import { Pyramid } from "../../primitives/Pyramid.js";

export class PinpointArrow extends CGFobject {
  constructor(scene) {
    super(scene);
    this.pyramid = new Pyramid(scene, 4, 1);

    this.shader = new CGFshader(
      scene.gl,
      "shaders/arrow.vert",
      "shaders/arrow.frag"
    );


    this.shader.setUniformsValues({
      time: 0,
      amplitude: 0.5,
      frequency: 2.0,
      color1: [1.0, 0.8, 0.0, 1.0],
      color2: [1.0, 0.2, 0.0, 1.0],
    });
  }

  display(time) {
    this.scene.setActiveShader(this.shader);
    this.shader.setUniformsValues({ time: time });

    this.scene.pushMatrix();
    

    this.scene.scale(0.8, 1.2, 0.8);
    this.scene.rotate(Math.PI, 1, 0, 0); 
    this.scene.translate(0, -1, 0);

    this.pyramid.display();

    this.scene.popMatrix();
    
    this.scene.setActiveShader(this.scene.defaultShader);
  }
}
