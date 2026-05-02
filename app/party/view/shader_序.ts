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
       if(rand1(uBpmCount + 1.5) > 0.75) pos = position.xyz * rotateZ((rand1(uBpmCount) - .5) * 2.) * 0.75;
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

     float index = mod(floor(bpmTime), 35.);
     float randomIndex = rand1(uBpmCount + 1.5);
      // index = 2.;

      vec4 color;
      if(index >= 0. && index <= 9.) color = sketch_block(texUv, bpmTime, uv);
      else if(index >= 10. && index <= 19.) color = sketch_distored(texUv, bpmTime, uv);
      else if(index >= 20. && index <= 29.) color = sketch_lumi(texUv, bpmTime, uv);
      else if(index >= 30. && index <= 34.) color = sketch_yohaku(texUv, bpmTime);

      // if(randomIndex > 0.66) color = sketch_block(texUv, bpmTime, uv);
      // else if(randomIndex > 0.33) color = sketch_distored(texUv, bpmTime, uv);
      // else  color = sketch_lumi(texUv, bpmTime, uv);


      // if(rand1(uBpmCount) > .75) color.rgb = step(color.rgb, vec3(.5));
      // color = mix(pow(color, vec4(4.)), vec4(vec3(1.), 1.), lumi(texture2D(uTex, vUv).rgb));
      if(rand1(uBpmCount + 1.53) > .85) color = mix(pow(color, vec4(1.)), vec4(vec3(1., .2, 0.2), 1.), lumi(texture2D(uTex, vUv).rgb) * fract(bpmTime));
      gl_FragColor = color;
   }`,
};
