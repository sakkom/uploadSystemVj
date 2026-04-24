import * as THREE from "three";
import { shader0 } from "./shader";

function ajustAspect(tex: THREE.Texture<any>, camera: THREE.PerspectiveCamera) {
  //整列手順
  const imgWidth = tex.image.width;
  const imgHeight = tex.image.height;
  const aspect = imgWidth / imgHeight;
  const rFov = (camera.fov * Math.PI) / 180;

  const base = Math.tan(rFov / 2) * camera.position.z;
  if (aspect > 1) {
    return { scaleH: base, scaleW: base * aspect };
  } else {
    return { scaleH: base / aspect, scaleW: base };
  }
  //元のplane(2, 2)すなわち1倍から何倍するか,三角錐abc、 tan = b/c
}

function randomEffect(mat: THREE.ShaderMaterial) {
  const effect = shaderMap[Math.floor(Math.random() * shaderMap.length)];
  mat.vertexShader = effect.vertexShader;
  mat.fragmentShader = effect.fragmentShader;
  mat.needsUpdate = true;
}

const shaderMap = [shader0];

export function previewShader(scene: THREE.Scene) {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  let mesh: THREE.Mesh | null = null;
  const timer = new THREE.Timer();

  const uniforms = {
    uTime: { value: 0.0 },
    uTex0: { value: new THREE.Texture() },
    uTex1: { value: new THREE.Texture() },
    uAspect0: { value: 1.0 },
    uAspect1: { value: 1.0 },
    uButtonRatio: { value: 0 },
  };

  const init = () => {
    const geo = new THREE.PlaneGeometry((2 * 4) / 3, 2, 1000, 1000);
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

  const update = async (
    texs: THREE.Texture<unknown, THREE.TextureEventMap>[],
    camera: THREE.PerspectiveCamera,
  ) => {
    timer.update();

    uniforms.uTex0.value = texs[0];
    uniforms.uTex1.value = texs[1];
    const tex0 = texs[0] as THREE.Texture<
      HTMLImageElement,
      THREE.TextureEventMap
    >;
    const tex1 = texs[1] as THREE.Texture<
      HTMLImageElement,
      THREE.TextureEventMap
    >;
    uniforms.uAspect0.value = tex0.image.width / tex0.image.height;
    uniforms.uAspect1.value = tex1.image.width / tex1.image.height;
    // const { scaleH, scaleW } = ajustAspect(texs[0], camera);
    // if (mesh) mesh.scale.set(scaleW, scaleH, 1);
    // randomEffect(mesh?.material as THREE.ShaderMaterial);

    // uniforms.uTime.value = timer.getElapsed();
  };

  const tick = (time: number, buttonRatio: number) => {
    uniforms.uTime.value = time;
    uniforms.uButtonRatio.value = buttonRatio;
  };

  return {
    get mesh() {
      return group;
    },
    init,
    update,
    tick,
  };
}
