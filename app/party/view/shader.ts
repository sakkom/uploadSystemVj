export const shader0 = {
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

   void main() {
     vec2 uv = vUv;

     vec3 texCol = texture2D(uTex, uv).rgb;
     float l = lumi(texCol);
     float pL = pow(l, .1);

     // texCol = pow(texCol, vec3(l * 5.));
     // if(rand1(l) > 0.0) {
     //   gl_FragColor = vec4(texCol, 1.);
     // } else {
     //   gl_FragColor = vec4(vec3(l), 1.);
     // }

     float parm = 0.2;
     if(texCol.g < parm && texCol.r < parm && texCol.b < parm) {
       texCol = vec3(1., 0., 0.);
       gl_FragColor = vec4(texCol, 1.);
     } else {
       gl_FragColor = vec4(texCol, 1.);
     }
   }`,
};

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

   void main() {
     vec2 uv = vUv;

     vec2 blockUv = floor(uv * 250.) / 250.;

     vec3 texCol = texture2D(uTex, blockUv).rgb;
     float l = lumi(texCol);
     float pL = pow(l, .1);

     texCol = pow(texCol, vec3(l * 5.)) * 1.5;
     if(rand1(l) > .5) {
       gl_FragColor = vec4(texCol, 1.);
     } else {
       gl_FragColor = vec4(vec3(l), 1.);
     }
   }`,
};

export const shader2 = {
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

   void main() {
     vec2 uv = vUv;

     // vec2 blockUv = floor(uv * 250.) / 250.;

     vec3 finalCol = vec3(.0);


     for(float i = .0; i < 7.; i++) {
      vec3 texCol = texture2D(uTex, uv - vec2(0., -.3 +i / 5. * 0.8)).rgb;
      float l = lumi(texCol);
      float pL = pow(l, .5) * 1.1;
      texCol = pow(texCol, vec3((1.-pL) * 1.5)) * 15.;
      float mono = lumi(texCol);
      if(rand1(i) > 0.5) {
        finalCol += vec3(mono);
      } else {
        finalCol += vec3(1.- texCol);
      }
     }

     // texCol = pow(texCol, vec3(1.));
     // gl_FragColor = vec4(vec3(finalCol * vec3(sin(finalCol.g * 1.), cos(finalCol.b * 2.), sin(finalCol.r * 3.))) , 1.);
     // gl_FragColor = mix(vec4(texCol1, 1.), vec4(vec3(1.-mono) , 1.), 0.5);
     gl_FragColor = vec4(finalCol / 7., 1.);
   }`,
};
