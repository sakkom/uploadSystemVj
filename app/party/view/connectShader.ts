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
     vec2 uv = vUv;
     // uv.x *= uResolution.x / uResolution.y;

     // float col = vec3(uv.x * uv.y);

     for (int i = 0; i < 100; i++) {
       // uv.x += sin(uv.y * 50.0) * fract(uTime) * 0.5 * sin(uTime);
       // uv.y += sin(uv.y * 50.0) * fract(uTime) * 0.1 * cos(uTime);

       float angle = atan(uv.y - 0.5, uv.x - 0.5);
       float dist = length(uv);
       vec2 sampleUv = vec2(dist, angle);
       // uv *= rot(angle);

       float randomX;

       float hatenaX = 5.0 * tan(uTime * 0.05) + 100.0 * cos(uTime);
       randomX = rand1(floor((uv.y + 1.0) * hatenaX)) * 100.0 * fract(uTime * 0.1) + 10.0;
       // randomX *= 1.0;
       uv.x = floor(uv.x * randomX) / randomX + 1.0;
       float hatenaY = 50.0 * tan(uTime * 0.01) + 10.0;
       float randomY = rand1(floor((vUv.x + 1.0) * hatenaY * randomX)) * 1000.0 * cos(uTime * 0.1) + 10.0;
       uv.y = floor(uv.y * randomY) / randomY;
       // uv.x = fract(-uTime * 1.0);
       // float absHatenaX = fract(uTime) * 2.0;
       float absHatenaX = 1.0;
       // uv.y = abs(vUv.y * absHatenaX);
       // uv *= rot(angle);
     }

     // 色
     float pattern = length(uv - 0.5);
     vec3 col = vec3(fract(pattern * 10.0 * fract(1.0 - uTime * .1) * 100.0 * cos(uTime * 0.1) + 1.0));
     float r = rand1(col.r);
     // if (r < 0.2) {
     //   col = vec3(1.0, 0.0, 0.0);
     // } else if (r < 0.4) {
     //   col = vec3(0.0, 1.0, 0.0);
     // } else if (r < 0.6) {
     //   col = vec3(1.0, 1.0, 0.0);
     // } else {
     //   col = col.r > 0.8 ? vec3(1.0) : vec3(0.0);
     // }
     col = col.r > 0.8 ? vec3(1.0) : vec3(0.0);

     gl_FragColor = vec4(col, 1.0);
     // gl_FragColor = texture2D(uTex0, uv);
   }
`,
};
