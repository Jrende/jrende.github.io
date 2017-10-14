precision mediump float;
uniform vec2 res;
uniform float amount;
uniform float alpha;

uniform sampler2D blurSampler;
void main(void) {
	gl_FragColor = vec4(gl_FragColor.x, gl_FragColor.x, gl_FragColor.x, 1.0);
}
