import { CGFobject } from '../../lib/CGF.js';

export class Cylinder extends CGFobject {
        constructor(scene, slices, stacks) {
                super(scene);
                this.slices = slices;
                this.stacks = stacks;
                this.initBuffers();

        }

        initBuffers() {
                this.vertices = [];
                this.indices = [];
                this.normals = [];

                var alpha = 2 * Math.PI / this.slices;

                
                for (var i = 0; i <= this.stacks; i++) {
                        
                        var z = i / this.stacks;

                        for (var j = 0; j < this.slices; j++) {
                                
                                var ang = j * alpha;

                                var cos_a = Math.cos(ang);
                                var sin_a = Math.sin(ang);

                                this.vertices.push(cos_a, sin_a, z);
                                this.normals.push(cos_a, sin_a, 0);
                        }

                }


                for (var i = 0; i < this.stacks; i++) {
                        for (var j = 0; j < this.slices; j++) {

                                var next = (j + 1) % this.slices;

                                var a = i * this.slices + j;
                                var b = (i + 1) * this.slices + j;

                                var c = i * this.slices + next;
                                var d = (i + 1) * this.slices + next;

                                this.indices.push(a, c, d);
                                this.indices.push(d, b, a);

                        }
                }

                this.primitiveType = this.scene.gl.TRIANGLES;
                this.initGLBuffers();
        }

        updateBuffers() {
                this.initGLBuffers();
        }


}       