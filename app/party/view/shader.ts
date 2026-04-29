import { INTERFACE_ASPECT } from "../photo/constant";

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
   uniform sampler2D uLive;
   uniform float uWindowAspect;
   uniform float uTexAspect;

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


   void main() {
     vec2 uv = vUv;
     uv = coverUv(uv, uTexAspect, uWindowAspect);

     vec3 texCol = texture2D(uTex, uv).rgb;
     vec3 liveTex = texture2D(uLive, vUv).rgb;
     int index = int(mod(uTime, 4.));
     if(index == 1) {
        liveTex = 1. - liveTex;
     }
     if(index == 2) {
        liveTex = vec3(0., liveTex.g, liveTex.b);
     }
     if(index == 3) {
        liveTex = pow(liveTex, vec3(10.));
     }
     if(index == 4) {
        liveTex = liveTex;
     }
     liveTex = pow(liveTex, vec3(3.));

     float texL = lumi(texCol);
     float mask = step(texL, 0.5);

     vec3 mixColor = mix(liveTex, texCol, 1.-mask);
     gl_FragColor = vec4(mixColor, 1.);
     // gl_FragColor = vec4(liveTex, 1.);
     // gl_FragColor = vec4(vec3(0., 0., 1.), 1.);
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
   uniform sampler2D uLive;
   uniform float uWindowAspect;
   uniform float uTexAspect;

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


   void main() {
     vec2 uv = vUv;
     uv = coverUv(uv, uTexAspect, uWindowAspect);

     vec3 texCol = texture2D(uTex, uv).rgb;
     vec3 liveTex = texture2D(uLive, vUv).rgb;
     int index = int(mod(uTime, 4.));
     if(index == 1) {
        liveTex = 1. - liveTex;
     }
     if(index == 2) {
        liveTex = vec3(0., liveTex.g, liveTex.b);
     }
     if(index == 3) {
        liveTex = pow(liveTex, vec3(10.));
     }
     if(index == 4) {
        liveTex = liveTex;
     }
     liveTex = pow(liveTex, vec3(3.));

     float texL = lumi(texCol);
     float mask = step(texL, 0.5);

     vec3 mixColor = mix(liveTex, texCol, 1.-mask);
     // gl_FragColor = vec4(mixColor, 1.);
     gl_FragColor = vec4(1.-liveTex, 1.);
     gl_FragColor = vec4(vec3(0., 1., 0.), 1.);

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
   uniform sampler2D uLive;
   uniform float uWindowAspect;
   uniform float uTexAspect;

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


   void main() {
     vec2 uv = vUv;
     uv = coverUv(uv, uTexAspect, uWindowAspect);

     vec3 texCol = texture2D(uTex, uv).rgb;
     vec3 liveTex = texture2D(uLive, vUv).rgb;
     int index = int(mod(uTime, 4.));
     if(index == 1) {
        liveTex = 1. - liveTex;
     }
     if(index == 2) {
        liveTex = vec3(0., liveTex.g, liveTex.b);
     }
     if(index == 3) {
        liveTex = pow(liveTex, vec3(10.));
     }
     if(index == 4) {
        liveTex = liveTex;
     }
     liveTex = pow(liveTex, vec3(3.));

     float texL = lumi(texCol);
     float mask = step(texL, 0.5);

     vec3 mixColor = mix(liveTex, texCol, 1.-mask);
     gl_FragColor = vec4(mixColor, 1.);
     gl_FragColor = vec4(liveTex, 1.);
     gl_FragColor = vec4(vec3(1., 0., 0.), 1.);
   }`,
};
export const shader3 = {
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
   uniform float uWindowAspect;
   uniform float uTexAspect;

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


   void main() {
     vec2 uv = vUv;
     uv = coverUv(uv, uTexAspect, uWindowAspect);

     vec3 texCol = texture2D(uTex, uv).rgb;
     vec3 liveTex = texture2D(uLive, vUv).rgb;
     int index = int(mod(uTime, 4.));
     if(index == 1) {
        liveTex = 1. - liveTex;
     }
     if(index == 2) {
        liveTex = vec3(0., liveTex.g, liveTex.b);
     }
     if(index == 3) {
        liveTex = pow(liveTex, vec3(10.));
     }
     if(index == 4) {
        liveTex = liveTex;
     }
     liveTex = pow(liveTex, vec3(3.));

     float texL = lumi(texCol);
     float mask = step(texL, 0.5);

     vec3 mixColor = mix(liveTex, texCol, 1.-mask);
     gl_FragColor = vec4(mixColor, 1.);
     // gl_FragColor = vec4(liveTex, 1.);
     gl_FragColor = vec4(vec3(1., 1., 0.), 1.);

   }`,
};
export const shader4 = {
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
   uniform float uWindowAspect;
   uniform float uTexAspect;

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


   void main() {
     vec2 uv = vUv;
     uv = coverUv(uv, uTexAspect, uWindowAspect);

     vec3 texCol = texture2D(uTex, uv).rgb;
     vec3 liveTex = texture2D(uLive, vUv).rgb;
     int index = int(mod(uTime, 4.));
     if(index == 1) {
        liveTex = 1. - liveTex;
     }
     if(index == 2) {
        liveTex = vec3(0., liveTex.g, liveTex.b);
     }
     if(index == 3) {
        liveTex = pow(liveTex, vec3(10.));
     }
     if(index == 4) {
        liveTex = liveTex;
     }
     liveTex = pow(liveTex, vec3(3.));

     float texL = lumi(texCol);
     float mask = step(texL, 0.5);

     vec3 mixColor = mix(liveTex, texCol, 1.-mask);
     gl_FragColor = vec4(mixColor, 1.);
     gl_FragColor = vec4(liveTex, 1.);
     gl_FragColor = vec4(vec3(1., 0., 1.), 1.);
   }`,
};
