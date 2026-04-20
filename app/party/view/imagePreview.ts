import * as THREE from "three";
import { shader0 } from "./shader";

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

      //整列手順
      const imgWidth = tex.image.width;
      const imgHeight = tex.image.height;
      const aspect = imgWidth / imgHeight;
      const rFov = (camera.fov * Math.PI) / 180;
      //元のplane(2, 2)すなわち1倍から何倍するか,三角錐abc、 tan = b/c
      const planeH = Math.tan(rFov / 2) * camera.position.z;
      const planeW = planeH * aspect;
      //

      if (mesh) mesh.scale.set(planeW, planeH, 1);
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
