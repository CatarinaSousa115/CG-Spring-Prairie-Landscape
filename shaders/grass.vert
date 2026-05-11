attribute vec3 position;
attribute vec2 texCoord;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float time;

varying vec2 vTexCoord;

void main() {

    vec3 pos = position;

    float wave =
        sin(time * 2.0 + position.x * 5.0)
        * 0.08;

    pos.x += wave * texCoord.y;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(pos, 1.0);

    vTexCoord = texCoord;
}