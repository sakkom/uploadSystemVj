export const shader1 = {
  vertexShader: `
     varying vec2 vUv;
     void main() {
       vUv = uv;
       // gl_Position = vec4(position, 1.0);
       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
     }
   `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform sampler2D uTex;
    uniform sampler2D uLive;
    uniform sampler2D uSnap;
    uniform float uWindowAspect;
    uniform float uTexAspect;
    uniform float uBpmCount;
    uniform float uBpm;
    uniform float uTermTime;

   float rand1(float y) {
     return fract(sin(y * 12.9898) * 43758.5453123);
   }
   float rand2(vec2 p) {
     return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
   }
   vec2 getOffset1(float index) {
     return vec2(rand1(index) - 0.5, rand1(index + 12.34) - 0.5);
   }
   vec2 getOffset2(vec2 p) {
     return vec2(rand2(p) - 0.5, rand2(p * 12.34) - 0.5);
   }
   vec2 rotatePos(vec2 p, float a) {
     return p * mat2(cos(a), -sin(a), sin(a), cos(a));
   }

   float lumi(vec3 color) {
     return dot(color, vec3(0.3, 0.59, 0.11));
   }

   vec2 coverUv(vec2 uv, float tA, float wA) {
     vec2 c = uv -.5;

     if(tA > wA) c.x /= tA / wA;
     else c.y *= tA / wA;
     return c + .5;
   }

   vec3 hsl2rgb(vec3 hsl) {
     float h = hsl.x;
     float s = hsl.y;
     float l = hsl.z;
     vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
     return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
   }

   vec4 sketch_cyber (vec2 texUv, float bpmTime) {
      float size = fract(floor(-bpmTime * 15.) / 15.) * 150.;
      texUv = floor((vUv - .5) * size) / size + .5;
      vec3 texCol = texture2D(uTex, texUv).rgb;

      float size1 = fract(floor(bpmTime * 15.) / 15.) * 150.;
      vec2 liveUv = floor((vUv - .5) * size1) / size1 + .5;
      vec3 liveCol = texture2D(uLive, liveUv).rgb; //use uLive

      float texL = lumi(texCol);
      texL =  step(texL, .5);
      float liveL =lumi(liveCol);
      liveL = step(liveL, .5);

      vec3 color = vec3(abs(texL - liveL));

      return vec4(color, 1.);
   }

   vec4 sketch_mandara(float bpmTime) {
      vec2 mandara = abs(vUv - .5);
      float a = atan(mandara.y, mandara.x);
      float dist = length(mandara);
      mandara = vec2(dist, (a + 3.14) / 6.28);

      vec3 texCol = texture2D(uTex, mandara).rgb;
      vec3 liveCol = texture2D(uLive, mandara).rgb;

      float texL = lumi(texCol);
      float liveL = lumi(liveCol);

      texCol = vec3(pow(texL, .5));

      liveCol *= hsl2rgb(vec3(fract(pow(liveL, 0.45) + bpmTime * 0.5), 1., .92));
      texCol *= hsl2rgb(vec3(fract(pow(texL, .5) + bpmTime * 0.5), 1., .92));

      vec3 color = vec3(abs(texCol - (1.-liveCol)));

      color = pow(1. - color, vec3(2.));

      return vec4(color, 1.);
   }

   vec4 sketch_distored(float bpmTime) {
      vec2 texUv = vUv - (rand1(uBpmCount) - .5);

      float amp = fract(bpmTime);
      float diff = rand1(uBpmCount) * 0.5;
      float freqY = texUv.y * 15.;
      float freqX = texUv.x * 15.;
      texUv.x += sin(freqX * rand1(uBpmCount) + fract(bpmTime))  * diff + sin(freqY * rand1(uBpmCount + 1.1) + fract(bpmTime)) * diff;
      texUv.y += sin(freqX * rand1(uBpmCount+2.2) - fract(bpmTime))  * diff + sin(freqY * rand1(uBpmCount+3.3) - fract(bpmTime))  * diff;
      texUv = rotatePos(texUv - .5, rand1(floor(length(texUv - .5) * 10.))) + .5;

      vec3 texCol = texture2D(uTex, (texUv - .5) + .5).rgb;
      vec3 liveCol = texture2D(uLive, (texUv - .5) + .5).rgb;

      float dist = length(texUv - .5);
      dist = floor(dist * 10. * fract(bpmTime * 0.25));
      dist = mod(dist, 2.);
      dist = step(dist, .5);

      vec3 color = vec3(abs(texCol-liveCol));
      color *= dist;
      color = pow(color, vec3(1.));

      float l = lumi(color);
      color *= hsl2rgb(vec3(fract(l * .5 + bpmTime), .5, 0.5));

      return vec4(color, 1.);
   }



   void main() {
     vec2 uv = vUv;
     vec2 texUv = coverUv(uv, uTexAspect, uWindowAspect);

     float bpmTime = uBpm / 60. * uTermTime;
     float index = mod(floor(bpmTime), 30.);

     vec4 color;

     if(index >= 0. && index <= 9.) color = sketch_cyber(texUv, bpmTime);
     else if(index >= 10. && index <= 19.) color = sketch_mandara(bpmTime);
     else if(index >= 20. && index <= 29.) color = sketch_distored(bpmTime);

     gl_FragColor = color;
   }`,
};
