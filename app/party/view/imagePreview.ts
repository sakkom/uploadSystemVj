import * as THREE from "three";
import { shader2 } from "./shader";
import { shader0 } from "./shader_序";
import { shader1 } from "./shader_破";
import { connect0 } from "./connectShader";

//使用側
// const { scaleH, scaleW } = ajustAspect(tex, camera);
// if (mesh) mesh.scale.set(scaleW, scaleH, 1);
// function ajustAspect(
//   tex: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>,
//   camera: THREE.PerspectiveCamera,
// ) {
//   //整列手順
//   const imgWidth = tex.image.width;
//   const imgHeight = tex.image.height;
//   const aspect = imgWidth / imgHeight;
//   const rFov = (camera.fov * Math.PI) / 180;
//   //元のplane(2, 2)すなわち1倍から何倍するか,三角錐abc、 tan = b/c
//   const scaleH = Math.tan(rFov / 2) * camera.position.z;
//   const scaleW = scaleH * aspect;
//   return { scaleH, scaleW };
// }

function setScale(aspect: number, camera: THREE.PerspectiveCamera) {
  const rFov = (camera.fov * Math.PI) / 180;
  //元のplane(2, 2)すなわち1倍から何倍するか,三角錐abc、 tan = b/c
  const scaleH = Math.tan(rFov / 2) * camera.position.z;
  const scaleW = scaleH * aspect;
  return { scaleH, scaleW };
}

// function randomEffect(mat: THREE.ShaderMaterial,shaderMap: THERE.ShaderMaterial[]) {
//   const effect = shaderMap[Math.floor(Math.random() * shaderMap.length)];
//   mat.vertexShader = effect.vertexShader;
//   mat.fragmentShader = effect.fragmentShader;
//   mat.needsUpdate = true;
// }

const 抽象具像シェーダ = [shader0, shader1, shader2];
const connectShader = [connect0];

export function imagePreview(scene: THREE.Scene) {
  const group = new THREE.Group();
  // const textureCache = new Map<string, THREE.Texture<HTMLImageElement>>();
  let mesh: THREE.Mesh | null = null;
  let windowAspect: number;
  let shaderMap: THREE.ShaderMaterial[] = [];

  let snapCanvas: HTMLCanvasElement;
  let snapCtx: CanvasRenderingContext2D;
  let snapTex: THREE.CanvasTexture;

  let connectEffect: THREE.ShaderMaterial[] = [];
  let isConnect: boolean = false;

  const uniforms = {
    uTime: { value: 0.0 },
    uTex: { value: new THREE.Texture() },
    uLive: { value: new THREE.Texture() },
    uTexAspect: { value: 4 / 3 },
    uWindowAspect: { value: 0 },
    uBpmCount: { value: 0 },
    uTermTime: { value: 0 },
    uBpm: { value: 0 },
    uSnap: { value: new THREE.Texture() },
  };
  const connectUniforms = {
    uTime: { value: 0 },
    uWindowAspect: { value: 0 },
  };

  const init = (
    aspect: number,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
  ) => {
    windowAspect = aspect;
    const geo = new THREE.PlaneGeometry(2, 2, 500, 500);

    uniforms.uBpm.value = 60;

    shaderMap = 抽象具像シェーダ.map(
      (s) => new THREE.ShaderMaterial({ uniforms, ...s, depthTest: true }),
    );
    connectEffect = connectShader.map(
      (s) =>
        new THREE.ShaderMaterial({
          uniforms: connectUniforms,
          ...s,
          depthTest: false,
        }),
    );
    mesh = new THREE.Mesh(geo, shaderMap[0]);
    const { scaleH, scaleW } = setScale(aspect, camera);
    if (mesh) mesh.scale.set(scaleW, scaleH, 1);
    group.add(mesh);
    scene.add(group);

    snapCanvas = document.createElement("canvas");
    snapCanvas.width = 1280;
    snapCanvas.height = 720;
    snapCtx = snapCanvas.getContext("2d")!;
    snapTex = new THREE.CanvasTexture(snapCanvas);
    renderer.initTexture(snapTex);
    uniforms.uSnap.value = snapTex;
  };

  const update = (tex: THREE.Texture<HTMLImageElement>, bpmCount: number) => {
    uniforms.uBpmCount.value = bpmCount;
    uniforms.uTex.value = tex;
    uniforms.uTexAspect.value = tex.image.width / tex.image.height;
    uniforms.uWindowAspect.value = windowAspect;
    connectUniforms.uWindowAspect.value = windowAspect;
    // randomEffect(mesh?.material as THREE.ShaderMaterial);
  };

  const setLive = (liveTex: THREE.VideoTexture<HTMLVideoElement>) => {
    uniforms.uLive.value = liveTex;
  };

  const setTime = (time: number) => {
    uniforms.uTime.value = time;
    connectUniforms.uTime.value = time;
  };

  const updateTermTime = (termTime: number) => {
    if (isConnect) return;
    uniforms.uTermTime.value = termTime;
  };

  const snap = () => {
    const live = uniforms.uLive.value as THREE.VideoTexture;
    if (!live.image) return;
    snapCtx.drawImage(live.image, 0, 0);
    snapTex.needsUpdate = true;
  };

  const next = (index: number, bpm: number) => {
    if (mesh && !isConnect) {
      isConnect = true;
      (mesh.material as THREE.ShaderMaterial) =
        connectEffect[Math.floor(Math.random() * connectEffect.length)];
      setTimeout(() => {
        uniforms.uTermTime.value = 0;
        uniforms.uBpm.value = bpm;
        if (mesh) {
          // console.log("change", index);
          (mesh.material as THREE.ShaderMaterial) = shaderMap[index];
          // (mesh.material as THREE.ShaderMaterial) = shaderMap[2];
        }
        isConnect = false;
      }, 1000);
    }
  };

  return {
    get mesh() {
      return group;
    },
    init,
    update,
    setLive,
    setTime,
    snap,
    next,
    updateTermTime,
  };
}
