attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float time;
uniform float amplitude;
uniform float frequency;

varying vec2 vTextureCoord;
varying float vHeightFactor;

void main() {
    // Vertical animation: y = sin(time * frequency) * amplitude
    float offset = sin(time * frequency) * amplitude;
    
    vec3 animatedPosition = aVertexPosition;
    animatedPosition.y += offset;

    // Passing height factor to fragment shader for a gradient effect
    vHeightFactor = aVertexPosition.y;

    gl_Position = uPMatrix * uMVMatrix * vec4(animatedPosition, 1.0);
    vTextureCoord = aTextureCoord;
}
