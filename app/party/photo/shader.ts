import { INTERFACE_ASPECT } from "./constant";

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
   uniform sampler2D uTex0;
   uniform sampler2D uTex1;
   uniform float uAspect0;
   uniform float uAspect1;
   uniform float uButtonRatio;

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

   vec2 coverUv(vec2 uv, float aspect) {
     vec2 c = uv -.5;

     if(aspect > 1.) c.x /= aspect / ${INTERFACE_ASPECT};
     else c.y *= aspect / ${INTERFACE_ASPECT};
     return c + .5;
   }

   void main() {
     vec2 uv = vUv;
     vec2 uv0 = coverUv(uv, uAspect0);
     vec2 uv1 = coverUv(uv, uAspect1);

     float ratio = fract(uTime * 5.);

     float block = floor(ratio * 50.) + 5.;
     vec2 blockUv = floor((vUv - .5)* block) / block + .5;
     blockUv = coverUv(blockUv, uAspect1);

     vec3 texCol0 = texture2D(uTex0, uv0).rgb;
     vec3 texCol1 = texture2D(uTex1, uv1).rgb;

     vec3 mixCol = mix(texCol0, texCol1, ratio);

     gl_FragColor = vec4(mixCol, 1.);
   }`,
};
