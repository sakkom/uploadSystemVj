import * as THREE from "three";
import { shader0, shader1, shader2, shader3, shader4 } from "./shader";
import { useRef } from "react";

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

const 抽象具像シェーダ = [shader0, shader1, shader2, shader3, shader4];

export function imagePreview(scene: THREE.Scene) {
  const group = new THREE.Group();
  // const textureCache = new Map<string, THREE.Texture<HTMLImageElement>>();
  const loader = new THREE.TextureLoader();
  let mesh: THREE.Mesh | null = null;
  let windowAspect: number;
  let shaderMap: THREE.ShaderMaterial[] = [];
  let currentIndex = 0;
  const termImages: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>[] =
    [];

  const uniforms = {
    uTime: { value: 0.0 },
    uTex: { value: new THREE.Texture() },
    uLive: { value: new THREE.Texture() },
    uTexAspect: { value: 4 / 3 },
    uWindowAspect: { value: 0 },
  };

  const init = (aspect: number, camera: THREE.PerspectiveCamera) => {
    windowAspect = aspect;
    const geo = new THREE.PlaneGeometry(2, 2, 1, 1);
    shaderMap = 抽象具像シェーダ.map(
      (s) => new THREE.ShaderMaterial({ uniforms, ...s, depthTest: false }),
    );
    mesh = new THREE.Mesh(geo, shaderMap[0]);
    const { scaleH, scaleW } = setScale(aspect, camera);
    if (mesh) mesh.scale.set(scaleW, scaleH, 1);
    group.add(mesh);
    scene.add(group);
  };

  const update = (tex: THREE.Texture<HTMLImageElement>, index: number) => {
    uniforms.uTex.value = tex;
    uniforms.uTexAspect.value = tex.image.width / tex.image.height;
    uniforms.uWindowAspect.value = windowAspect;
    // randomEffect(mesh?.material as THREE.ShaderMaterial);
  };

  const setLive = (liveTex: THREE.VideoTexture<HTMLVideoElement>) => {
    uniforms.uLive.value = liveTex;
  };

  const setTime = (time: number) => {
    uniforms.uTime.value = time;
  };
  const updateMaterial = (index: number) => {
    if (currentIndex !== index && mesh) {
      // console.log(index);
      (mesh.material as THREE.ShaderMaterial) = shaderMap[index];
      currentIndex = index;
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
    updateMaterial,
  };
}
