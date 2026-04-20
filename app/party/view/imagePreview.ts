import * as THREE from "three";
import { shader0 } from "./shader";

export function imagePreview(scene: THREE.Scene) {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

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
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    scene.add(group);
  };

  const update = (url: string, time: number) => {
    loader.load(url, (tex) => {
      uniforms.uTex.value = tex;
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
