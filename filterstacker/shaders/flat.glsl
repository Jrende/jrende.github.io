precision mediump float;
uniform vec2 res;
uniform float alpha;
uniform float r;
uniform float g;
uniform float b;
void main(void) {
	gl_FragColor = vec4(r, g, b, alpha);
}
