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
      vec2 texUv = vUv;

      float amp = fract(bpmTime);
      float diff = rand1(uBpmCount) * 0.5 + .1;
      float freqY = texUv.y * 25. + 5.;
      float freqX = texUv.x * 25. + 5.;
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

   vec4 sketch_kuroi() {
     vec2 uv = vUv;
     uv.x *= uWindowAspect;
     vec2 offset = vec2((fract(uTime * .1) - 0.5) * 2.0, 0.0);
     float dist = length(uv - offset) - 0.3;
     float a = atan(uv.y, uv.x);
     float noise = rand2(uv) - 0.5;
     float s = smoothstep(1.0, 0.5, abs(dist));
     vec3 col = vec3(s);
     col += noise * 0.1;
     col = pow(col, vec3(3.));
     return vec4(1.-col, 1.);

   }

   vec4 sketch_tama0() {
     vec2 uv = vUv * 2.0 - 1.0;
     uv.x *= uWindowAspect;
     vec2 pos = uv;

     vec3 balls = vec3(0.0);

     float finalColor = 100.0;
     float index = 0.0;

     float loopNum = 80.0;

     for (float i = 0.0; i < loopNum; i++) {
       float ni = (i + 1.0) / loopNum;
       float delay = i * 0.01;
       // vec2 offset = orbit(uTime + delay);
       float angle = rand1(i) * 6.28;
       //startの調整
       float start = 1.5;
       float speed = uTime * 3.0;
       float scale = (sin(speed * ni + start) * 0.5 + 0.5);
       vec2 offset = vec2(cos(angle), sin(angle)) * scale;

       //pos noise
       vec2 noiseOffset = vec2(rand2(pos * 12.34), rand2(pos * 56.78)) - 0.5;
       pos += noiseOffset * 0.005;

       float lightness;
       if (rand1(uTime) > 0.6 && uTime > 3.5 && mod(uTime, 5.0) > 2.5) {
         // vec2 noiseOffset = vec2(rand2(pos * 12.34), rand2(pos * 56.78)) - 0.5;
         // pos += noiseOffset * 0.03;
         lightness = 1.0;
       } else {
         // pos.x = floor(pos.x * 1000.0) / 1000.0;
         // pos.y = floor(pos.y * 100.0) / 100.0;
         // pos = mod(vUv + 0.5, 0.5) - 0.5;

         lightness = 0.5;
       }

       float ballBasedSize = 1.5;
       float ballSize = (cos(uTime + i) * 0.5 + 0.5) * ballBasedSize * ni;
       float dist1 = length(pos - offset) - ballSize;
       float dist2 = min(abs(pos.x - offset.x), abs(pos.y - offset.y)) - 0.01;
       float dist = mix(dist1, dist2, scale);
       float col = smoothstep(0.1, -0.1, dist);
       // vec3 ame = mix(vec3(1.0, 0.0, 0.0), vec3(.0, 0.0, 1.0), scale);

       vec3 color = hsl2rgb(vec3(0.7 * pow(scale, 0.9), 1.0, lightness));
       col *= 1.0 - ni;
       // color = mix(vec3(1.0), color, 0.3);

       balls += col * color / 1.8;
     }

     balls = pow(balls, vec3(2.0));
     if (uTime < 35.0) {
       return vec4(vec3(balls), 1.0);
     } else {
       return vec4(vec3(0.0), 1.0);
     }
   }


   void main() {
     vec2 uv = vUv;
     vec2 texUv = coverUv(uv, uTexAspect, uWindowAspect);

     float bpmTime = uBpm / 60. * uTermTime;

     float s0 = 1.;
     float s1 = s0 + 5.;
     float s2 = s1 + 2.;
     float s3 = s2 + 1.;
     float s4 = s3 + 2.;
     float s5 = s4 + 10.;
     float s6 = s5 + 2.;
     float s7 = s6 + 5.;
     float s8 = s7 + 3.;
     float s9 = s8 + 1.;

     float index = mod((bpmTime), s9);


     vec4 color;

     if(index < s0) color = vec4(vec3(0.), 1.);
     else if(index < s1) color = sketch_cyber(texUv, bpmTime);
     else if(index < s2) color = sketch_distored(bpmTime);
     else if(index < s3) color = vec4(vec3(0.), 1.);
     else if(index < s4) color = sketch_kuroi();
     else if(index < s5) color = sketch_mandara(bpmTime);
     else if(index < s6) color = sketch_cyber(texUv, bpmTime);
     else if(index < s7) color = sketch_distored(bpmTime);
     else if(index < s8) color = sketch_kuroi();
     else if(index < s9) color = vec4(vec3(0.), 1.);

     gl_FragColor = color;
   }`,
};
