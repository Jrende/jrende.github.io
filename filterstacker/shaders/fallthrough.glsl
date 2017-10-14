precision mediump float;
uniform vec2 res;
uniform sampler2D tSampler;
uniform float alpha;

void main(void) {
	vec4 color = texture2D(tSampler, vec2(gl_FragCoord.xy) / vec2(512, 512));
	gl_FragColor = vec4(color.rgb, alpha);
}
