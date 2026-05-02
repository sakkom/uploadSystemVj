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
       // float index = mod(floor(bpmTime), 28.);

       vec3 pos = position;

       float s0 = 1.;
       float s1 = s0 + 5.;
       float s2 = s1 + 1.;
       float s3 = s2 + 2.;
       float s4 = s3 + 5.;
       float s5 = s4 + 2.;
       float s6 = s5 + 1.;
       float s7 = s6 + 8.;
       float s8 = s7 + 3.;
       float s9 = s8 + 2.;

       float index = mod((bpmTime), s9);


       if(index < s0) pos = position;
       else if(index < s1) pos = sketch_rotateXy(bpmTime);
       else if(index < s2) pos = position;
       else if(index < s3) pos = position;
       else if(index < s4) pos = sketch_piano(bpmTime);
       else if(index < s5) pos = position;
       else if(index < s6) pos = position;
       else if(index < s7) pos = sketch_z(bpmTime);
       else if(index < s8) pos = position;
       else if(index < s9) pos = sketch_rotateXy(bpmTime);

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

   vec2 lemniscate(float t, float scale) {
     float x = cos(t) * 0.5;
     float y = sin(t) * cos(t) * 0.5;
     return vec2(x, y) * scale;
   }
   float sdCircle(vec2 p, float radius) {
     return length(p) - radius;
   }
   mat2 rotate2D(float angle) {
     float c = cos(angle), s = sin(angle);
     return mat2(c, -s, s, c);
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

   float opSmoothUnion(float d1, float d2, float k) {
     k *= 4.0;
     float h = max(k - abs(d1 - d2), 0.0);
     return min(d1, d2) - h * h * 0.25 / k;
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

   vec4 sketch_lemni() {
     vec2 uv = vUv - .5;
     uv.x *= uWindowAspect;
     float offset = sin(length(uv) * 10.0) * 0.2;
     float offset2 = sin(uv.y * 10.0) * 0.1;
     float offset3 = mix(offset, offset2, sin(uTime));
     vec2 offset4 = sin(uv * 10.0) * 0.1;

     uv += offset;
     float dist = 100.0;
     vec3 finalColor = vec3(0.0);
     for (int i = 0; i < 3; i++) {
       float fi = float(i + 1);

       float angle = float(i) * 10.0;
       //[1.0, 2.0]の範囲
       float speed = rand1(fi + 1.0);
       //[0.3, 0.5]
       float scale = 0.3 + fi * 0.5;
       float radius = 0.1 + fi / 5.0 * 0.5;

       vec2 offset = lemniscate(uTime * speed, scale);
       offset *= rotate2D(angle);
       float ballDist = sdCircle(uv + offset, radius);

       vec3 ballColor = vec3(
           rand1(fi * 1.1),
           rand1(fi * 2.3),
           rand1(fi * 3.7)
         );
       float distColor = smoothstep(0.3, -0.1, ballDist);
       finalColor += distColor * ballColor;
       dist = opSmoothUnion(dist, ballDist, 0.1);
     }
     float mask = smoothstep(1.0, -1.0, abs(dist));

     float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);

     vec3 insideColor = vec3(
         // abs(sin((abs(dist) / 0.5) + uTime))
         abs(sin(abs(dist) * 10.0)),
         abs(cos(abs(dist) * 5.0 + uTime * 0.5)),
         abs(sin(abs(dist) * 3.0))
       ) * 15.0;
     insideColor = mix(vec3(1.0), insideColor, 0.05);

     insideColor += (noise - 0.5) * 0.5;

     vec3 color = insideColor * mask;
     return vec4(color, 1.);
   }


   vec4 sketch_kusa(float bpmTime) {
     vec2 uv = vUv;
     uv = uv - 0.5;
     uv.x *= uWindowAspect;

     float pattern = 100.0;
     int closestLayer = 0;

     for (int i = 0; i < 5; i++) {
       vec2 offset = vec2(rand1(float(i + 1) * 100.0), rand1(float(i + 1) * 200.0));
       uv += offset - 0.6;
       float dist1 = length(uv);
       float angle = atan(uv.y, uv.x);

       float dist2 = max(abs(uv.x + offset.x), abs(uv.y + offset.y));

       float dist = mix(dist1, dist1, pow(sin(uTime * 0.5), 1.0));

       angle = angle < 0.0 ? angle + 6.28 : angle;
       angle += float(i);
       // angle = mod(float(i), 2.0) == 0.0 ? angle + uTime * 0.5 : angle - uTime * 0.5;
       angle += uTime * 0.5;

       float wave = 0.01 + float(i + 8) * 0.125;
       float time = mod(float(i), 2.0) == 0.0 ? uTime : -uTime;
       // vec2 blockUv = floor(uv * 1000.0);
       float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
       // angle = noise * 1.57;
       float y = pow(sin(angle * dist * float(i + 1)),
           1.0);
       // float amp = float(i) / 10.0;
       float amp = 0.1 + fract(noise + uTime * 0.1 * float(i)) * 0.1;
       y = y > 0.0 ? y * amp * 0.5 : y * amp;
       wave += y;

       float d = abs(dist - wave);
       // float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
       // d += noise * 0.05;
       if (d < pattern) {
         pattern = d;
         closestLayer = i;
       }
     }

     vec3 col;
     float mask = smoothstep(0.1, -0.1, pattern);
     vec3 insideColor = vec3(
         // abs(sin((abs(dist) / 0.5) + uTime))
         abs(tan(abs(pattern * float(closestLayer)) * 10.0)),
         abs(cos(abs(pattern * float(closestLayer)) * 5.0 + uTime * 0.5)),
         abs(sin(abs(pattern * float(closestLayer)) * 3.0))
       ) * 10.0;
     // uv = floor(uv * 500.0);
     float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
     insideColor += noise * 1.0;
     col = insideColor * mask;
     col = mix(vec3(1.0), col, 0.6);

     return vec4(col * fract(bpmTime * 5.), 1.);
   }

   vec4 sketch_tama2() {
     vec2 uv = vUv - .5;
     uv.x *= uWindowAspect;

     float angle = atan(uv.y, uv.x);
     angle = angle < 0. ? angle + 6.28 : angle;

     vec2 newUv = uv;

     uv *= 2.;
     vec3 finalCol = vec3(0.);
     for(float i = 0.; i < 10.; i++) {
       vec2 offset = getOffset1(i + floor(-uTime * 5.));
       float ball = length(uv + offset * .1 ) - exp(.8 * i / 10.) * rand1(floor(uTime * 2.));
       float col = smoothstep(0.1, -0.1, (ball));

       if(rand1(i + floor(uTime * 20.)) > 0.5) {
         finalCol += col * hsl2rgb(vec3(i + uTime, 0.5, .5)) * step(rand1(i + floor(-uTime * 10.)), .5);
       } else {
         finalCol += col * vec3(sin(i)) * step(rand1(i + floor(-uTime * 5.)), .5);
       }
     }


     return  vec4(vec3(1.-finalCol * 5.), 1.0);
   }


   void main() {
     vec2 uv = vUv;
     float bpmTime = uBpm / 60. * uTermTime;

     // vec4 color = sketch_z(uv, bpmTime);
     // vec4 color = sketch_piano(uv, bpmTime);
     // vec4 color = sketch_rotateXy(uv, bpmTime);

     // float index = mod(floor(bpmTime), 28.);

     float s0 = 1.;
     float s1 = s0 + 5.;
     float s2 = s1 + 1.;
     float s3 = s2 + 2.;
     float s4 = s3 + 5.;
     float s5 = s4 + 2.;
     float s6 = s5 + 1.;
     float s7 = s6 + 8.;
     float s8 = s7 + 3.;
     float s9 = s8 + 2.;

     float index = mod((bpmTime), s9);


     vec4 color;
     if(index < s0) color = sketch_tama2();
     else if(index < s1) color = sketch_rotateXy(uv, bpmTime);
     else if(index < s2) color = vec4(vec3(0.), 1.);
     else if(index < s3) color = sketch_kusa(bpmTime);
     else if(index < s4) color = sketch_piano(uv, bpmTime);
     else if(index < s5) color = sketch_tama2();
     else if(index < s6) color = vec4(vec3(0.), 1.);
     else if(index < s7) color = sketch_z(uv, bpmTime);
     else if(index < s8) color = sketch_kuroi();
     else if(index < s9) color = sketch_rotateXy(uv, bpmTime);



     gl_FragColor = color;
   }`,
};
