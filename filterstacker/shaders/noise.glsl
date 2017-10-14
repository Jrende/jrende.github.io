precision mediump float;
uniform vec2 res;
uniform float alpha;

float rand(vec2 vector) {
  return fract( 43758.5453 * sin( dot(vector, vec2(12.2934, 78.1234))));
}
void main(void) {
	gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * rand(gl_FragCoord.xy), alpha);
	//gl_FragColor = vec4(amount/100.0,amount/100.0,amount/100.0, alpha);
}
