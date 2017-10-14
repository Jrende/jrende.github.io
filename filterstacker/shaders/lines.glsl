precision mediump float;
uniform vec2 res;
uniform float alpha;
uniform float r, g, b;
uniform float x, y;
uniform float scale;
void main(void) {
	float color;
	color = clamp(ceil(mod(gl_FragCoord.x + x, 100.0)) - scale, 0.0, 1.0);
	color += clamp(ceil(mod(gl_FragCoord.y + y, 100.0)) - scale, 0.0, 1.0);
	gl_FragColor = vec4( vec3(r, g, b) * color, alpha);
}
