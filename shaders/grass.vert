// shaders/grass.vert
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform float time;

varying vec2 vTexCoord;

void main() {
    vec3 pos = aVertexPosition;

    float wave = sin(time * 2.0 + pos.x * 5.0 + pos.z * 3.0) * 0.08;
    
    pos.x += wave * aTextureCoord.y; 

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);

    vTexCoord = aTextureCoord;
}