export const shader2 = {
  vertexShader: `
     varying float vTexL;
     varying vec2 vUv;
     uniform sampler2D uTex;
     uniform sampler2D uLive;
     uniform float uBpm;
     uniform float uTermTime;
     uniform float uBpmCount;
     uniform float uTime;

     float lumi(vec3 color) {
       return dot(color, vec3(0.3, 0.59, 0.11));
     }
     float rand1(float y) {
       return fract(sin(y * 12.9898) * 43758.5453123);
     }
     float rand2(vec2 p) {
       return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
     }
     vec2 getOffset2(vec2 p) {
       return vec2(rand2(p) - 0.5, rand2(p * 12.34) - 0.5);
     }
     vec2 rotatePos(vec2 p, float a) {
       return p * mat2(cos(a), -sin(a), sin(a), cos(a));
     }
     mat3 rotateZ(float a) {
       float c = cos(a), s = sin(a);
       return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
     }
     mat3 rotateY(float angle) {
       float c = cos(angle);
       float s = sin(angle);
       return mat3(
         c, 0., s,
         0., 1., 0.,
         -s, 0., c
       );
     }

     vec3 sketch_rotateXy(float bpmTime) {
      float size = 10. * rand1(uBpmCount) + 5.;
      vec2 bUv = floor(vUv * size) / size;
      vec3 texCol = texture2D(uTex, bUv).rgb;
      float l = lumi(texCol);
      vTexL = l;
      vec3 pos = position;
      pos.xy += getOffset2(bUv) * .5 * fract(bpmTime);
      pos.xy = rotatePos(pos.xy, uTime);
      if(rand1(uBpmCount + 1.1) > .6) pos.xy *= fract(bpmTime);
      if(rand1(uBpmCount + 1.2) > .6) pos.xy *= 1.-fract(bpmTime);

      return pos;
     }

     vec3 sketch_piano(float bpmTime) {
      float size = 100. * rand1(uBpmCount) + 5.;
      vec2 bUv = floor(vUv * size) / size;
      vec3 texCol = texture2D(uTex, bUv).rgb;
      float l = lumi(texCol);
      vTexL = l;
      vec3 pos = position;
      if(rand1(uBpmCount + 4.2) > .66) pos = pos * rotateZ(uTime);
      pos.y = rand1(uBpmCount + 2.1) > .2 ? (rand1(l) - .5) * 2. * fract(bpmTime) : (rand1(l) - .5) * 2. * (1.-fract(bpmTime));
      if(rand1(uBpmCount + 3.2) > .66) pos = pos * rotateZ(uTime);

      return pos;
     }

     vec3 sketch_z(float bpmTime) {
      float size = 100. * rand1(uBpmCount) + 5.;
      vec2 bUv = floor(vUv * size) / size;
      vec3 texCol = texture2D(uTex, bUv).rgb;
      float l = lumi(texCol);
      vTexL = l;
      vec3 pos = position;
      float dir = rand1(uBpmCount) > .6 ? fract(bpmTime) : fract(-bpmTime);
      float signRand = rand1(uBpmCount + 1.1) > .5 ? 1. : -1.;
      pos.z = signRand * rand1(l) * 1.5 * dir;

      if(rand1(uBpmCount + 2.8) > .66) pos.x += (fract(bpmTime * .1) - .5) * 3.;
      if(rand1(uBpmCount + 2.8) > .66) pos.y += (fract(bpmTime * .1) - .5) * 1.;

      return pos;
     }

     void main() {
       vUv = uv;

       float bpmTime = uBpm / 60. * uTermTime;

       float index = mod(floor(bpmTime), 30.);
       float randomIndex = rand1(uBpmCount);

       vec3 pos = position;
       if(index >= 0. && index <= 9.) pos = sketch_piano(bpmTime);
       else if(index >= 10. && index <= 19.) pos = sketch_z(bpmTime);
       else if(index >= 20. && index <= 29.) pos = sketch_rotateXy(bpmTime);

       gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
     }
   `,
  fragmentShader: `
  varying vec2 vUv;
   varying float vTexL;
   uniform float uTime;
   uniform sampler2D uTex;
   uniform sampler2D uLive;
   uniform float uWindowAspect;
   uniform float uTexAspect;
   uniform float uBpm;
   uniform float uTermTime;
   uniform float uBpmCount;

   float rand1(float y) {
     return fract(sin(y * 12.9898) * 43758.5453123);
   }
   float rand2(vec2 p) {
     return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
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

   vec4 sketch_rotateXy(vec2 uv, float bpmTime) {

    if(rand1(uBpmCount) > .33 )uv *= fract(bpmTime)* 0.5 + .5;
    uv += getOffset2(uv) * 0.01;

    float size = 25. * rand1(uBpmCount) + 5.;
    vec2 bUv = floor(uv * size) / size;

    vec3 texCol = texture2D(uTex, bUv).rgb;
    vec3 liveCol = texture2D(uLive, bUv).rgb;
    texCol = pow(texCol, vec3(5.));

    float texL = lumi(texCol);

    vec3 color = vec3(abs(texCol - liveCol));
    float l = lumi(color);

    color = pow(color, vec3(1.));
    l = pow(lumi(color), 2.5);
    color *= hsl2rgb(vec3(fract(l* .45 + rand1(floor(bpmTime))), 1., .6)) * 1.5;

    // if(rand1(bpmTime) > .85) {
    // gl_FragColor = vec4(hsl2rgb(vec3(rand1(uTime), 1., .5)), 1.);
    //   // gl_FragColor = vec4(vec3(0., .0, 1.), 1.);
    //   return;
    // }

    return vec4(color, 1.);
   }

   vec4 sketch_piano(vec2 uv, float bpmTime) {
    float size = 100. * rand1(uBpmCount) + 5.;
    vec2 bUv = floor(uv * size) / size;

    vec3 liveCol = texture2D(uLive, bUv).rgb;
    liveCol = pow(liveCol, vec3(.3)); //uKido

    vec3 texCol = texture2D(uTex, bUv).rgb;

    // liveCol = pow(liveCol, vec3(2.));
    texCol = vec3(abs(liveCol-texCol));


    float texL = lumi(texCol);
    // texL = pow(texL, .5);

    vec3 stepValue = rand1(uBpmCount) > .5 ? vec3(.5) : vec3(.5) * fract(bpmTime);
    texCol = step(texL, stepValue);

    return vec4(1.-texCol, 1.);
   }

   vec4 sketch_z(vec2 uv, float bpmTime) {
    // if(rand1(uBpmCount + 2.8) > .5) uv += fract(bpmTime * 100.) - .5;
    float size = 100. * rand1(uBpmCount) + 5.;
    vec2 bUv = floor(uv * size) / size;

    vec3 liveCol = texture2D(uLive, bUv).rgb;
    liveCol = pow(liveCol, vec3(.1)); //uKido

    vec3 texCol = texture2D(uTex, bUv).rgb;
    texCol = rand1(uBpmCount + 1.1) > .5 ? vec3(abs(liveCol-texCol)) : texCol;

    float texL = lumi(texCol);
    float colorRange = rand1(uBpmCount) > .8 ? 1. : 0.2;
    if(rand1(uBpmCount + 1.1) > 0.9) colorRange = 10.;
    texCol *= hsl2rgb(vec3(fract(pow(texL, 2.) * colorRange + bpmTime), .5, .5)) ;

    return vec4(texCol * 2., bUv);
   }


   void main() {
     vec2 uv = vUv;
     float bpmTime = uBpm / 60. * uTermTime;

     // vec4 color = sketch_z(uv, bpmTime);
     // vec4 color = sketch_piano(uv, bpmTime);
     // vec4 color = sketch_rotateXy(uv, bpmTime);

     float index = mod(floor(bpmTime), 30.);
     float randomIndex = rand1(uBpmCount) * 3.;

     vec4 color;
     if(index >= 0. && index <= 9.) color = sketch_piano(uv, bpmTime);
     else if(index >= 10. && index <= 19.) color = sketch_z(uv, bpmTime);
     else if(index >= 20. && index <= 29.) color = sketch_rotateXy(uv, bpmTime);

     gl_FragColor = color;
   }`,
};
