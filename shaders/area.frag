#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 uBaseColor;

void main() {
    gl_FragColor = uBaseColor;
}
