import * as THREE from "three";
import { shader0, shader1, shader2 } from "./shader";

function ajustAspect(
  tex: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>,
  camera: THREE.PerspectiveCamera,
) {
  //整列手順
  const imgWidth = tex.image.width;
  const imgHeight = tex.image.height;
  const aspect = imgWidth / imgHeight;
  const rFov = (camera.fov * Math.PI) / 180;
  //元のplane(2, 2)すなわち1倍から何倍するか,三角錐abc、 tan = b/c
  const scaleH = Math.tan(rFov / 2) * camera.position.z;
  const scaleW = scaleH * aspect;
  return { scaleH, scaleW };
}

function randomEffect(mat: THREE.ShaderMaterial) {
  const effect = shaderMap[Math.floor(Math.random() * shaderMap.length)];
  mat.vertexShader = effect.vertexShader;
  mat.fragmentShader = effect.fragmentShader;
  mat.needsUpdate = true;
}

const shaderMap = [shader0, shader1, shader2];

export function imagePreview(scene: THREE.Scene) {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  let mesh: THREE.Mesh | null = null;

  const uniforms = {
    uTime: { value: 0.0 },
    uTex: { value: new THREE.Texture() },
  };

  const init = () => {
    const geo = new THREE.PlaneGeometry(2, 2, 1000, 1000);
    const mat = new THREE.ShaderMaterial({
      vertexShader: shader0.vertexShader,
      fragmentShader: shader0.fragmentShader,
      uniforms,
      depthTest: false,
    });
    mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    scene.add(group);
  };

  const update = (
    url: string,
    time: number,
    camera: THREE.PerspectiveCamera,
  ) => {
    loader.load(url, (tex) => {
      uniforms.uTex.value = tex;

      const { scaleH, scaleW } = ajustAspect(tex, camera);
      if (mesh) mesh.scale.set(scaleW, scaleH, 1);
      randomEffect(mesh?.material as THREE.ShaderMaterial);
    });
    uniforms.uTime.value = time;
  };

  return {
    get mesh() {
      return group;
    },
    init,
    update,
  };
}
