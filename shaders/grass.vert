attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float uTime;
uniform float uWindSpeed;
uniform float uWindStrength;
uniform float uPhase;

void main() {
    vec3 pos = aVertexPosition;

    // influence: 0 na base, 1 no topo
    float influence = clamp(pos.y, 0.0, 1.0);

    // sway no eixo X
    float sway = sin(uTime * uWindSpeed + uPhase) * uWindStrength * influence;

    pos.x += sway;

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}