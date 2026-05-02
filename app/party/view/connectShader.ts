export const connect0 = {
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
   uniform float uWindowAspect;


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


   void main() {
     vec2 uv = vUv - .5;
     uv.x *= uWindowAspect;

     float angle = atan(uv.y, uv.x);
     float dist = length(uv);

     vec2 distortionUv = uv;


     vec3 finalCol = vec3(0.);

     // uv = abs(uv);
     // uv.y = fract((uv.y + 0.5) * 2.) - .5;

     vec2 newUv = uv;
     for(float i = 0.; i < 10.; i++) {
       float dist = length(newUv - rand1(i));
       newUv = rotatePos(newUv, dist * 5.);
       // newUv *= 1.1;
       // newUv += getOffset2(floor(newUv * 50. + uTime)) * .01;
       vec2 offset = vec2(cos(uTime), sin(uTime)) *  (1. - i / 10.) * .4;
       float ball = length(newUv - offset) - i / 10. * .3;
       float line = abs(newUv.y- sin(uTime * (i + 1.) / 10.) * 0.5);
       // float colBall = step(abs(ball), 0.1);
       float colBall = smoothstep(0.1, .0, abs(ball));
       finalCol += colBall * vec3(sin(i * 10. * abs(sin(uTime * .01))));
       // finalCol += colBall * hsl2rgb(vec3(i / 10. * .3 + .8, 1., .5));
       // finalCol += colBall * hsl2rgb(vec3(i / 10. * .3 + .8 + uTime, 1., .3));
     }



     gl_FragColor = vec4(vec3(finalCol), 1.0);
     // gl_FragColor = vec4(vec3(lumi(vec3(newUv, 1.))), 1.0);
   }
`,
};

export const connect1 = {
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
   uniform float uWindowAspect;


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

   void main() {
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


     gl_FragColor = vec4(vec3(1.-finalCol * 5.), 1.0);
   }
`,
};

export const connect2 = {
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
   uniform float uWindowAspect;


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


   // void main() {
   //   vec2 uv = vUv - .5;
   //   uv.x *= uWindowAspect;
   //   vec2 warpUv = uv;
   //   warpUv.x += (sin(warpUv.x * 45.) + cos(warpUv.y * 25. + uTime * 3.)) * 0.01;
   //   warpUv.y += (sin(warpUv.y * 35.) + cos(warpUv.x * 10.)) * 0.01;



   //   vec3 finalCol = vec3(0.);


   //   float loopNum = 30.;

   //   for(float i = 0.; i < loopNum; i++) {
   //     // warpUv.x *= sin(uTime * 0.5);
   //     // warpUv.x += (rand1(i)  - .5) * 0.5;
   //     // warpUv += getOffset2(warpUv) * 0.01 * i/ loopNum;

   //     float circleDist = length(warpUv) - 0.3;
   //     // float col = step(abs(circleDist), i / loopNum * .5);
   //     float col = step((circleDist), 0.);

   //     // finalCol += col * vec3(sin(i)) * rand2(warpUv);
   //     finalCol += col * vec3(sin(i)) * rand2(floor(warpUv * 800.) / 800.);
   //     // warpUv = rotatePos(warpUv, i / loopNum * 6.28 + uTime * 0.5);
   //     warpUv = rotatePos(warpUv + getOffset1(i) * 0.1, rand1(i) * 6.28 + floor(uTime * 5.) * (i + 1.) / loopNum );
   //     warpUv *= 1.1;
   //     // warpUv.x += rand1(uTime * 0.5);
   //   }

   //   finalCol = pow(finalCol, vec3(5.));

   //   gl_FragColor = vec4(vec3(finalCol), 1.0);
   // }

   // void main() {
   //   vec2 uv = vUv * 2.0 - 1.0;
   //   uv.x *= uWindowAspect;
   //   vec2 pos = uv;

   //   vec3 balls = vec3(0.0);

   //   float finalColor = 100.0;
   //   float index = 0.0;

   //   float loopNum = 80.0;

   //   for (float i = 0.0; i < loopNum; i++) {
   //     float ni = (i + 1.0) / loopNum;
   //     float delay = i * 0.01;
   //     // vec2 offset = orbit(uTime + delay);
   //     float angle = rand1(i) * 6.28;
   //     //startの調整
   //     float start = 1.5;
   //     float speed = uTime * 3.0;
   //     float scale = (sin(speed * ni + start) * 0.5 + 0.5);
   //     vec2 offset = vec2(cos(angle), sin(angle)) * scale;

   //     //pos noise
   //     vec2 noiseOffset = vec2(rand2(pos * 12.34), rand2(pos * 56.78)) - 0.5;
   //     pos += noiseOffset * 0.005;

   //     float lightness;
   //     if (rand1(uTime) > 0.6 && uTime > 3.5 && mod(uTime, 5.0) > 2.5) {
   //       // vec2 noiseOffset = vec2(rand2(pos * 12.34), rand2(pos * 56.78)) - 0.5;
   //       // pos += noiseOffset * 0.03;
   //       lightness = 1.0;
   //     } else {
   //       // pos.x = floor(pos.x * 1000.0) / 1000.0;
   //       // pos.y = floor(pos.y * 100.0) / 100.0;
   //       // pos = mod(vUv + 0.5, 0.5) - 0.5;

   //       lightness = 0.5;
   //     }

   //     float ballBasedSize = 1.5;
   //     float ballSize = (cos(uTime + i) * 0.5 + 0.5) * ballBasedSize * ni;
   //     float dist1 = length(pos - offset) - ballSize;
   //     float dist2 = min(abs(pos.x - offset.x), abs(pos.y - offset.y)) - 0.01;
   //     float dist = mix(dist1, dist2, scale);
   //     float col = smoothstep(0.1, -0.1, dist);
   //     // vec3 ame = mix(vec3(1.0, 0.0, 0.0), vec3(.0, 0.0, 1.0), scale);

   //     vec3 color = hsl2rgb(vec3(0.7 * pow(scale, 0.9), 1.0, lightness));
   //     col *= 1.0 - ni;
   //     // color = mix(vec3(1.0), color, 0.3);

   //     balls += col * color / 1.8;
   //   }

   //   balls = pow(balls, vec3(2.0));
   //   if (uTime < 35.0) {
   //     gl_FragColor = vec4(vec3(balls), 1.0);
   //   } else {
   //     gl_FragColor = vec4(vec3(0.0), 1.0);
   //   }
   // }


   //草みたいなやつつかいたい //これもラスト? あとたま三つは序にいれる
   // void main() {
   //   vec2 uv = vUv;
   //   uv = uv - 0.5;
   //   uv.x *= uWindowAspect;

   //   float pattern = 100.0;
   //   int closestLayer = 0;

   //   for (int i = 0; i < 5; i++) {
   //     vec2 offset = vec2(rand1(float(i + 1) * 100.0), rand1(float(i + 1) * 200.0));
   //     // offset *= abs(fract(uTime * 0.5)) - 0.5;
   //     // offset *= 5.0;
   //     // uv.x += offset.x * sin(uTime * 1.0);
   //     // float dist = length(uv + offset);
   //     // uv.x -= offset.x;
   //     // vec2 sampleUv = floor(uv * 1000.0);
   //     uv += offset - 0.6;
   //     float dist1 = length(uv);
   //     float angle = atan(uv.y, uv.x);

   //     // float dist2 = min(abs(uv.x + (fract(offset.x + uTime) - 0.5) * 50.0), abs(uv.y));
   //     float dist2 = max(abs(uv.x + offset.x), abs(uv.y + offset.y));
   //     // float dist2 = length(uv + offset) * (1.0 + abs(sin(angle * 5.0)) * 0.5);
   //     // float dist2 = min(abs(uv.x + offset.x), abs(uv.y + offset.y));
   //     float dist = mix(dist1, dist1, pow(sin(uTime * 0.5), 1.0));

   //     angle = angle < 0.0 ? angle + 6.28 : angle;
   //     angle += float(i);
   //     // angle = mod(float(i), 2.0) == 0.0 ? angle + uTime * 0.5 : angle - uTime * 0.5;
   //     angle += uTime * 0.5;

   //     float wave = 0.01 + float(i + 8) * 0.125;
   //     float time = mod(float(i), 2.0) == 0.0 ? uTime : -uTime;
   //     // vec2 blockUv = floor(uv * 1000.0);
   //     float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
   //     // angle = noise * 1.57;
   //     float y = pow(sin(angle * dist * float(i + 1)),
   //         1.0);
   //     // float amp = float(i) / 10.0;
   //     float amp = 0.1 + fract(noise + uTime * 0.1 * float(i)) * 0.1;
   //     y = y > 0.0 ? y * amp * 0.5 : y * amp;
   //     wave += y;

   //     float d = abs(dist - wave);
   //     // float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
   //     // d += noise * 0.05;
   //     if (d < pattern) {
   //       pattern = d;
   //       closestLayer = i;
   //     }
   //   }

   //   vec3 col;
   //   float mask = smoothstep(0.1, -0.1, pattern);
   //   vec3 insideColor = vec3(
   //       // abs(sin((abs(dist) / 0.5) + uTime))
   //       abs(tan(abs(pattern * float(closestLayer)) * 10.0)),
   //       abs(cos(abs(pattern * float(closestLayer)) * 5.0 + uTime * 0.5)),
   //       abs(sin(abs(pattern * float(closestLayer)) * 3.0))
   //     ) * 10.0;
   //   // uv = floor(uv * 500.0);
   //   float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
   //   insideColor += noise * 1.0;
   //   col = insideColor * mask;
   //   col = mix(vec3(1.0), col, 0.6);

   //   gl_FragColor = vec4(col, 1.0);
   // }

   //これまたリング全体的なやつきれい slow　ラスト?
   // void main() {
   //   vec2 uv = vUv;
   //   uv = uv - 0.5;
   //   uv.x *= uWindowAspect;

   //   vec3 col = vec3(0.0);
   //   float spacing = 0.5;

   //   float index = 0.0;
   //   float pattern = 100.0;
   //   for (float y = -1.0; y < 1.0; y += spacing) {
   //     for (float x = -1.0; x < 1.0; x += spacing) {
   //       vec2 offsetUv = uv - vec2(x, y);
   //       // offsetUv = floor(offsetUv * 100.0) / 100.0;
   //       // offsetUv += vec2(rand2(offsetUv * 12.34), rand2(offsetUv * 56.78)) * 0.05;

   //       float l = length(uv);
   //       float baseRadius = fract(uTime * 0.01 * index) * 2.0;
   //       float radius = baseRadius * sin(index * offsetUv.x * 1.0) * cos(index * offsetUv.y * 1.0);

   //       float dist = length(offsetUv) - radius;
   //       // float dist = max(abs(offsetUv.x), abs(offsetUv.y)) - radius;

   //       float edge = smoothstep(0.4, -0.2, abs(dist));
   //       // float edge = step(abs(dist), 0.001);

   //       vec3 ballColor = vec3(
   //           abs(tan(dist + index * 8.0)),
   //           abs(cos(dist + index * 5.0 + uTime)),
   //           abs(cos(dist + index * 10.0))
   //         ) * 1.0;
   //      //ここ色味
   //       vec3 mixColor = mix(vec3(1.0), ballColor, 0.5);

   //       col += edge * mixColor;

   //       index += 1.0;
   //     }
   //   }

   //   gl_FragColor = vec4(col, 1.0);
   // }


   float stepRand(float t, float speed) {
     return rand1(floor(t * speed));
   }

   float opSmoothUnion(float d1, float d2, float k) {
     k *= 4.0;
     float h = max(k - abs(d1 - d2), 0.0);
     return min(d1, d2) - h * h * 0.25 / k;
   }


   //grid circle結構いい // 使い所不明序かな？
   // void main() {
   //   float gridSize = 3.0; //奇数対応
   //   float gridSpace = 2.0;
   //   vec2 uv = vUv * gridSize * 2.0 - gridSize;

   //   float halfPoint = 0.5;
   //   float radius = 0.5;

   //   //設定
   //   float diffuse = 0.3;

   //   //layers
   //   float gridBalls = 0.0;
   //   vec3 simpleBalls = vec3(0.0);
   //   float smoothBalls = 100.0;
   //   float gridBox = 0.0;

   //   vec3 colorSeed = vec3(0.0);
   //   float index = 0.0;

   //   vec2 pos = uv;
   //   float outGrid = 2.0;
   //   for (float j = 0.0; j < gridSize + outGrid; j++) {
   //     for (float i = 0.0; i < gridSize + outGrid; i++) {
   //       vec2 gridPos = vec2(0.0);

   //       gridPos.y = mod(j, 2.0) == 0.0 ? gridPos.y - (j / 2.0) * gridSpace : gridPos.y + ((j + 1.0) / 2.0) * gridSpace;
   //       gridPos.x = mod(i, 2.0) == 0.0 ? gridPos.x - (i / 2.0) * gridSpace : gridPos.x + ((i + 1.0) / 2.0) * gridSpace;

   //       float circles = 0.0;
   //       for (float i = 0.0; i < 20.0; i++) {
   //         float ball = length(pos - gridPos) - halfPoint * 2.0 * i / 20.0;
   //         float edge = smoothstep(0.01, -0.00, abs(ball));
   //         circles += edge;
   //       }
   //       gridBalls += circles;

   //       float box = max(abs(pos.x - gridPos.x), abs(pos.y - gridPos.y)) - 1.0;
   //       float boxEdge = smoothstep(0.01, -0.00, abs(box));
   //       gridBox += boxEdge;

   //       for (float b = 0.0; b < 2.0; b++) {
   //         float seed = j + i + b;
   //         float randomStart = rand1(seed);
   //         float rotDir = (step(rand1(seed), 0.5) * 2.0 - 1.0) * uTime;
   //         float speed = (1.0 + rand1(seed));
   //         float a = randomStart * speed + rotDir;
   //         vec2 rotOffset = b == 0.0 ? vec2(cos(a), sin(a)) * 0.5 : vec2(cos(a), sin(a)) * (1.0 + radius);
   //         vec2 ballPos = pos - gridPos - rotOffset;

   //         ballPos += rand2(ballPos) * 0.1;

   //         float ball = length(ballPos) - radius;

   //         float edge = smoothstep(0.01, -0.0, abs(ball));
   //         simpleBalls += edge;

   //         smoothBalls = opSmoothUnion(smoothBalls, ball, diffuse);
   //       }
   //     }
   //   }

   //   float metaBall = smoothstep(0.1, -0.0, abs(smoothBalls));

   //   // vec3 layer1 = mix(vec3(gridBalls), vec3(balls), 0.5) * 1.0;
   //   vec3 layer1 = mix(vec3(gridBalls), vec3(metaBall), 0.5) * 1.0;
   //   vec3 color = mix(layer1, vec3(gridBox), 0.5) * 1.0;

   //   gl_FragColor = vec4(vec3(color) * 10.0, 1.0);
   // }


   //acid build //connect effect color?
   // void main() {
   //   vec2 uv = vUv;
   //   // uv.x *= uResolution.x / uResolution.y;

   //   // float col = vec3(uv.x * uv.y);

   //   for (int i = 0; i < 100; i++) {
   //     // uv.x += sin(uv.y * 50.0) * fract(uTime) * 0.5 * sin(uTime);
   //     // uv.y += sin(uv.y * 50.0) * fract(uTime) * 0.1 * cos(uTime);

   //     float angle = atan(uv.y - 0.5, uv.x - 0.5);
   //     float dist = length(uv);
   //     vec2 sampleUv = vec2(dist, angle);
   //     // uv *= rot(angle);

   //     float randomX;

   //     float hatenaX = 5.0 * tan(uTime * 0.05) + 100.0 * cos(uTime);
   //     randomX = rand1(floor((uv.y + 1.0) * hatenaX)) * 100.0 * fract(uTime * 0.1) + 10.0;
   //     // randomX *= 1.0;
   //     uv.x = floor(uv.x * randomX) / randomX + 1.0;
   //     float hatenaY = 50.0 * tan(uTime * 0.01) + 10.0;
   //     float randomY = rand1(floor((vUv.x + 1.0) * hatenaY * randomX)) * 1000.0 * cos(uTime * 0.1) + 10.0;
   //     uv.y = floor(uv.y * randomY) / randomY;
   //     // uv.x = fract(-uTime * 1.0);
   //     // float absHatenaX = fract(uTime) * 2.0;
   //     float absHatenaX = 1.0;
   //     // uv.y = abs(vUv.y * absHatenaX);
   //     // uv *= rot(angle);
   //   }

   //   // 色
   //   float pattern = length(uv - 0.5);
   //   vec3 col = vec3(fract(pattern * 10.0 * fract(1.0 - uTime * .1) * 100.0 * cos(uTime * 0.1) + 1.0));
   //   float r = rand1(col.r);
   //   // if (r < 0.2) {
   //   //   col = vec3(1.0, 0.0, 0.0);
   //   // } else if (r < 0.4) {
   //   //   col = vec3(0.0, 1.0, 0.0);
   //   // } else if (r < 0.6) {
   //   //   col = vec3(1.0, 1.0, 0.0);
   //   // } else {
   //   //   col = col.r > 0.8 ? vec3(1.0) : vec3(0.0);
   //   // }
   //   col = col.r > 0.8 ? vec3(1.0) : vec3(0.0);

   //   gl_FragColor = vec4(col, 1.0);
   //   // gl_FragColor = texture2D(uTex0, uv);
   // }

   //
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

   //おきにいりのlemnicircle //急
   // void main() {
   //   vec2 uv = vUv - .5;
   //   uv.x *= uWindowAspect;
   //   float offset = sin(length(uv) * 10.0) * 0.2;
   //   float offset2 = sin(uv.y * 10.0) * 0.1;
   //   float offset3 = mix(offset, offset2, sin(uTime));
   //   vec2 offset4 = sin(uv * 10.0) * 0.1;
   //   // uv += mix(offset4.x, offset, cos(uTime));

   //   uv += offset;
   //   float dist = 100.0;
   //   vec3 finalColor = vec3(0.0);
   //   for (int i = 0; i < 3; i++) {
   //     float fi = float(i + 1);
   //     // float angle = rand1(fi) * 6.28;
   //     float angle = float(i) * 10.0;
   //     //[1.0, 2.0]の範囲
   //     // float speed = 1.0 + fi * 0.1;
   //     float speed = rand1(fi + 1.0);
   //     //[0.3, 0.5]
   //     float scale = 0.3 + fi * 0.5;
   //     float radius = 0.1 + fi / 5.0 * 0.5;
   //     // float radius = 0.3;

   //     vec2 offset = lemniscate(uTime * speed, scale);
   //     offset *= rotate2D(angle);
   //     float ballDist = sdCircle(uv + offset, radius);

   //     // vec3 ballColor = vec3(float(i) * 1.2, float(i) * 3.4, float(i) * 5.6);
   //     vec3 ballColor = vec3(
   //         rand1(fi * 1.1),
   //         rand1(fi * 2.3),
   //         rand1(fi * 3.7)
   //       );
   //     float distColor = smoothstep(0.3, -0.1, ballDist);
   //     finalColor += distColor * ballColor;
   //     dist = opSmoothUnion(dist, ballDist, 0.1);
   //   }
   //   float mask = smoothstep(1.0, -1.0, abs(dist));

   //   // vec2 noiseUV = floor(uv * 500.0) / 500.0; // もっと細かく
   //   float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);

   //   vec3 insideColor = vec3(
   //       // abs(sin((abs(dist) / 0.5) + uTime))
   //       abs(sin(abs(dist) * 10.0)),
   //       abs(cos(abs(dist) * 5.0 + uTime * 0.5)),
   //       abs(sin(abs(dist) * 3.0))
   //     ) * 15.0;
   //   insideColor = mix(vec3(1.0), insideColor, 0.05);

   //   insideColor += (noise - 0.5) * 0.5;

   //   vec3 color = insideColor * mask;
   //   gl_FragColor = vec4(color, 1.0);
   // }

   //シンプルだけどいい。黒いたま //序破急共通
   // void main() {
   //   vec2 uv = vUv - 0.5;
   //   uv.x *= uWindowAspect;
   //   // uv *= sin(uv.x);
   //   vec2 offset = vec2((fract(uTime * .1) - 0.5) * 2.0, 0.0);
   //   float dist = length(uv - offset) - 0.3;
   //   float a = atan(uv.y, uv.x);
   //   // dist += sin(uv.y * 100.0) * 0.05;
   //   // vec2 blockUv = floor(uv * 500.0);
   //   float noise = rand2(uv) - 0.5;
   //   float s = smoothstep(1.0, 0.5, abs(dist));
   //   // vec3 col = vec3(s);
   //   // s += noise * 0.1 * dist;
   //   vec3 col = vec3(s);
   //   col += noise * 0.1;
   //   col = pow(col, vec3(3.));
   //   gl_FragColor = vec4(1.-col, 1.0);
   // }

   void main() {
      gl_FragColor = vec4(vec3(1.), 1.);
   }
`,
};
