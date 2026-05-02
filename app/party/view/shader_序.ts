export const shader0 = {
  vertexShader: `
     varying vec2 vUv;
     uniform float uBpmCount;
     uniform float uBpm;
     uniform float uTermTime;

     mat3 rotateY(float angle) {
       float c = cos(angle);
       float s = sin(angle);
       return mat3(
         c, 0., s,
         0., 1., 0.,
         -s, 0., c
       );
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
     mat3 rotateZ(float a) {
       float c = cos(a), s = sin(a);
       return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
     }


     void main() {
      float bpmTime = uBpm / 60. * uTermTime;
      vUv = uv;
       // if(rand1(uBpmCount) > .5) vUv = uv + getOffset2(floor(uv * 10.)) * 0.1 * fract(bpmTime);
       // gl_Position = vec4(position, 1.0);
       vec3 pos = position.xyz;
       // if(rand1(uBpmCount + 1.5) > 0.75) pos = position.xyz * rotateZ((rand1(uBpmCount) - .5) * 2.) * 0.75;
       gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
     }
   `,
  fragmentShader: `
   varying vec2 vUv;
   uniform float uTime;
   uniform sampler2D uTex;
   uniform sampler2D uLive;
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
   vec2 coverUv(vec2 uv, float tA, float wA, float scale) {
     vec2 c = uv -.5;

     if(tA > wA) c.x /= tA / wA;
     else c.y *= tA / wA;
     c *= scale;
     return c + .5;
   }
   vec3 hsl2rgb(vec3 hsl) {
     float h = hsl.x;
     float s = hsl.y;
     float l = hsl.z;
     vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
     return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
   }

   vec4 sketch_block(vec2 texUv, float bpmTime, vec2 uv) {
   vec2 liveUv = vUv;
    if(rand1(uBpmCount + .95) > .75) liveUv = fract(liveUv * 5.);
     if(vUv.x > 0.95 || vUv.x < 0.05 || vUv.y > 0.95 || vUv.y < 0.05) {
       return vec4(vec3(0., 0., 1.), 1.) * pow(fract(bpmTime * .5), 2.);
     }
     if(uv.x < 0.25 || uv.x > .75 || uv.y < .25 || uv.y > .75) {
       vec2 blockUv = liveUv;
       blockUv.x += (rand1(floor(vUv.y * 10.) + uBpmCount) - .5)  * (fract(bpmTime)) * .1;
       vec3 liveTex = texture2D(uLive, blockUv).rgb;
       liveTex = pow(liveTex, vec3(1.)); //uKido?
       float l = lumi(liveTex);
       vec3 color = pow(vec3(1.-l), vec3(3.));

       return vec4(color, 1.);
     }
     vec2 blockUv = texUv;
     blockUv.y += (rand1(floor(blockUv.x * 10.) + uBpmCount) - .10)  * fract(bpmTime) * .5;
     vec3 texCol = texture2D(uTex, blockUv).rgb;
     texCol = pow(texCol, vec3(1.5));

     return vec4(texCol, 1.);
   }

   vec4 sketch_distored(vec2 texUv, float bpmTime, vec2 uv) {
   vec2 distoredUv = vUv;
   if(rand1(uBpmCount + 5.323) > .5) distoredUv.x += getOffset2(vUv).x * 0.5 * fract(-bpmTime);
   if(rand1(uBpmCount + 5.323) > .5) texUv.x += getOffset2(texUv).x * 0.5 * fract(bpmTime);
     if(distoredUv.x > 0.95 || distoredUv.x < 0.05 || distoredUv.y > 0.95 || distoredUv.y < 0.05) {
        return vec4(vec3(0., 0., 1.), 1.) * pow(fract(bpmTime * .5), 2.);
     }
     if(uv.x < 0.25 || uv.x > .75 || uv.y < .25 || uv.y > .75) {
       distoredUv.x += sin(distoredUv.y * 500. + uBpmCount) * 0.01  + cos(distoredUv.y * 5.+ uBpmCount) * 0.01;

       vec3 shiftColor = vec3(0.);
       vec2 offset = vec2(1. * (fract(bpmTime * 0.5) - .5), 0.);
       shiftColor.r = texture2D(uLive, distoredUv + offset).r;
       shiftColor.g = texture2D(uLive, distoredUv).g;
       shiftColor.b = texture2D(uLive, distoredUv - offset).b;
       shiftColor = pow(shiftColor, vec3(1.5)) * 2.;  //uKido注意

       return vec4(1.-shiftColor, 1.);
     }
     vec3 texCol = texture2D(uTex, texUv).rgb;
     texCol = vec3(pow(lumi(texCol), 3.));

     return vec4(texCol, 1.);
   }

   vec4 sketch_lumi(vec2 texUv, float bpmTime, vec2 uv) {
      vec2 liveUv = vUv;
      if(rand1(uBpmCount + .95) > .75) liveUv.x += fract(bpmTime * 10.) - .5;
      if(liveUv.x > 0.95 || liveUv.x < 0.05 || liveUv.y > 0.95 || liveUv.y < 0.05) {
        return vec4(vec3(0., 0., 1.), 1.) * pow(fract(bpmTime * .5), 2.);
      }
      if(uv.x < 0.25 || uv.x > .75 || uv.y < .25 || uv.y > .75) {

        vec3 liveTex = texture2D(uLive, liveUv).rgb;
        //midiで調整!!!!!vec3(0.1);
        liveTex = pow(liveTex, vec3(1.));
        float l = lumi(1.-liveTex);
        l *= 2.;

        float speed = bpmTime * 0.25;
        liveTex *= vec3(fract(speed+ l+ rand1(uBpmCount)), fract(speed + l + rand1(uBpmCount + 1.1)), fract(speed + l+ rand1(uBpmCount  + 2.3)));

        float invert = step(vUv.x, fract(bpmTime * 0.25));
        vec3 color = mix(liveTex, pow(1. - liveTex, vec3(3.0)), invert);

        return vec4(color, 1.);
      }
      vec3 texCol = texture2D(uTex, texUv).rgb;
      texCol = pow(texCol, vec3(.5));
      float texL = lumi(texCol);

      float speed = bpmTime * 1.;
      texCol *= vec3(fract(speed + texL+ rand1(uBpmCount + 9.8)), fract(speed+ texL + rand1(uBpmCount + 8.7)), fract(speed + texL+ rand1(uBpmCount  + 7.6)));
      float invert = step(vUv.y, fract(-bpmTime * .25));
      texCol = mix(texCol, pow(1. - texCol, vec3(3.)), invert);
      return vec4(texCol, 1.);
   }

   vec4 sketch_yohaku(vec2 texUv, float bpmTime) {
      if(vUv.x < 0.25 || vUv.x > .75 || vUv.y < .25 || vUv.y > .75) {
        return vec4(0., 0, 1., 1.);
      }
      vec3 texCol = texture2D(uTex, texUv).rgb;
      float l = lumi(texCol);
      l = step(l, .5);
      float mono  = rand1(floor(bpmTime)) > .5 ? l : 1. - l;
      vec3 color = mix(vec3(0., 0., 1.), vec3(mono), l);

      return  vec4(color, 1.);
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

   vec4 sketch_smoothRing(float bpmTime) {
     vec2 uv = vUv;
     uv = uv - 0.5;
     uv.x *= uWindowAspect;

     vec3 col = vec3(0.0);
     float spacing = 0.5;

     float index = 0.0;
     float pattern = 100.0;
     for (float y = -1.0; y < 1.0; y += spacing) {
       for (float x = -1.0; x < 1.0; x += spacing) {
         vec2 offsetUv = uv - vec2(x, y);
         // offsetUv = floor(offsetUv * 100.0) / 100.0;
         // offsetUv += vec2(rand2(offsetUv * 12.34), rand2(offsetUv * 56.78)) * 0.05;

         float l = length(uv);
         float baseRadius = fract(uTime * 0.01 * index) * 2.0;
         float radius = baseRadius * sin(index * offsetUv.x * 1.0) * cos(index * offsetUv.y * 1.0);

         float dist = length(offsetUv) - radius;
         // float dist = max(abs(offsetUv.x), abs(offsetUv.y)) - radius;

         float edge = smoothstep(0.4, -0.2, abs(dist));
         // float edge = step(abs(dist), 0.001);

         vec3 ballColor = vec3(
             abs(tan(dist + index * 8.0)),
             abs(cos(dist + index * 5.0 + uTime)),
             abs(cos(dist + index * 10.0))
           ) * 1.0;
        //ここ色味
         vec3 mixColor = mix(vec3(1.0), ballColor, 0.5);

         col += edge * mixColor;

         index += 1.0;
       }
     }

     return vec4(col, 1.) * fract(bpmTime * .5);
   }

   vec4 sketch_kusa() {
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

     return vec4(col, 1.);
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

   vec4 sketch_tama1(float bpmTime) {
     vec2 uv = vUv - .5;
     uv.x *= uWindowAspect;
     vec2 warpUv = uv;
     warpUv.x += (sin(warpUv.x * 45.) + cos(warpUv.y * 25. + uTime * 3.)) * 0.01;
     warpUv.y += (sin(warpUv.y * 35.) + cos(warpUv.x * 10.)) * 0.01;



     vec3 finalCol = vec3(0.);


     float loopNum = 30.;

     for(float i = 0.; i < loopNum; i++) {
       // warpUv.x *= sin(uTime * 0.5);
       // warpUv.x += (rand1(i)  - .5) * 0.5;
       // warpUv += getOffset2(warpUv) * 0.01 * i/ loopNum;

       float circleDist = length(warpUv) - 0.3;
       // float col = step(abs(circleDist), i / loopNum * .5);
       float col = step((circleDist), 0.);

       // finalCol += col * vec3(sin(i)) * rand2(warpUv);
       finalCol += col * vec3(sin(i)) * rand2(floor(warpUv * 800.) / 800.);
       // warpUv = rotatePos(warpUv, i / loopNum * 6.28 + uTime * 0.5);
       warpUv = rotatePos(warpUv + getOffset1(i) * 0.1, rand1(i) * 6.28 + floor(uTime * 5.) * (i + 1.) / loopNum );
       warpUv *= 1.1;
       // warpUv.x += rand1(uTime * 0.5);
     }

     finalCol = pow(finalCol, vec3(5.));
     finalCol = mix(vec3(0., 0., 1.), finalCol, (lumi(finalCol)));

     return vec4(vec3(finalCol) * pow(fract(bpmTime), 1.), 1.0);
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

   vec4 sketch_tama3(float bpmTime) {
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


     finalCol = mix(vec3(0., 0., 1.), finalCol, (lumi(finalCol)));


     return vec4(vec3(finalCol) * fract(bpmTime), 1.0);
     // gl_FragColor = vec4(vec3(lumi(vec3(newUv, 1.))), 1.0);
   }


   void main() {
     vec2 uv = vUv;
     float bpmTime = (uBpm / 60. * uTermTime);
     if(rand1(uBpmCount + .93) > .9) uv.x += fract(bpmTime * 10.) - .5;
     uv += getOffset1(bpmTime) * 0.015;

     vec2 texUv = coverUv(uv, uTexAspect, uWindowAspect, 1.);
     uv += getOffset1(bpmTime) * 0.01;

     if(rand1(bpmTime) > 0.95) {
       gl_FragColor = vec4(vec3(0.), 1.);
       return;
     }

     // float index = mod((bpmTime), 22.);
     // float randomIndex = rand1(uBpmCount + 1.5);
      // index = 2.;

      vec4 color;
      // if(index >= 0. && index <= 9.) color = sketch_block(texUv, bpmTime, uv);
      // else if(index >= 10. && index <= 19.) color = sketch_distored(texUv, bpmTime, uv);
      // else if(index >= 20. && index <= 29.) color = sketch_lumi(texUv, bpmTime, uv);
      // else if(index >= 30. && index <= 34.) color = sketch_yohaku(texUv, bpmTime);


      float s0 = 2.;
      float s1 = s0 + 1.;
      float s2 = s1 + 5.;
      float s3 = s2 + 1.;
      float s4 = s3 + 1.;
      float s5 = s4 + 2.;
      float s6 = s5 + 4.;
      float s7 = s6 + 2.;
      float s8 = s7 + 1.;
      float s9 = s8 + 8.;

      float index = mod((bpmTime), s9);


      if(index < s0) color = sketch_smoothRing(bpmTime);
      else if(index < s1) color = sketch_yohaku(texUv, bpmTime);
      else if(index < s2) color = sketch_block(texUv, bpmTime, uv);
      else if(index < s3) color = sketch_tama1(bpmTime);
      else if(index < s4) color = sketch_distored(texUv, bpmTime, uv);
      else if(index < s5) color = sketch_yohaku(texUv, bpmTime);
      else if(index < s6) color = sketch_distored(texUv, bpmTime, uv);
      else if(index < s7) color = sketch_tama3(bpmTime);
      else if(index < s8) color = sketch_yohaku(texUv, bpmTime);
      else if(index < s9) color = sketch_lumi(texUv, bpmTime, uv);


      // if(rand1(uBpmCount) > .75) color.rgb = step(color.rgb, vec3(.5));
      // color = mix(pow(color, vec4(4.)), vec4(vec3(1.), 1.), lumi(texture2D(uTex, vUv).rgb));
      if(rand1(uBpmCount + 1.53) > .9) color = mix(pow(color, vec4(1.)), vec4(vec3(1., .2, 0.2), 1.), lumi(texture2D(uTex, vUv).rgb) * fract(bpmTime));
      gl_FragColor = color;
   }`,
};
