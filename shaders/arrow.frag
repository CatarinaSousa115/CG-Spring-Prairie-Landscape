precision highp float;

varying vec2 vTextureCoord;
varying float vHeightFactor;

uniform vec4 color1;
uniform vec4 color2;
uniform float time;

void main() {
    // Gradient based on local y-coordinate (vHeightFactor)
    // and a pulsing effect based on time
    float pulse = (sin(time * 3.0) + 1.0) / 2.0;
    vec4 baseColor = mix(color1, color2, vHeightFactor);
    
    // Add a bit of glow/pulse
    gl_FragColor = baseColor + vec4(0.2, 0.2, 0.0, 0.0) * pulse;
}
