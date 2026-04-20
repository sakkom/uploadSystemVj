"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { previewShader } from "./preview";
import { url } from "node:inspector/promises";

export function setThree(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const WIDTH = 400;
  const HEIGHT = 300;
  const aspect = WIDTH / HEIGHT;
  // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  // renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setPixelRatio(1);
  renderer.setSize(WIDTH, HEIGHT);
  scene.background = null;
  return { scene, camera, renderer, aspect };
}

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputImgs = useRef<THREE.Texture[]>([]);
  // const [previewIndex, setPreviewIndex] = useState<number>(0);
  // const clock = new THREE.Clock();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loader = new THREE.TextureLoader();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const index = Math.floor((clock.getElapsedTime() * 2) % previews.length);
  //     setPreviewIndex(index);
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, [previews]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/server-upload", {
      method: "post",
      body: formData,
    });
    // if (res.ok) {
    //   const data = await res.json();
    //   console.log({ data });
    // }
  };

  const handleSubmit = async () => {
    const files = inputRef.current?.files;
    if (!files) return;
    await Promise.all(Array.from(files).map(uploadFile));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log(files);
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));

    const promises = urls.map((url) => loader.loadAsync(url));
    Promise.all(promises).then((textures) => {
      inputImgs.current = textures;
    });

    setPreviews(urls);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const { scene, camera, renderer, aspect } = setThree(canvasRef.current);
    camera.position.z = 2;

    const view = previewShader(scene);
    view.init();

    //bpm test clock
    const timer = new THREE.Timer();
    let bpmCounter = 0;

    const loop = () => {
      if (inputImgs.current.length === 0) {
        requestAnimationFrame(loop);
        return;
      }
      timer.update();
      const time = timer.getElapsed();
      const bpm = 60;
      const bpmCount = Math.floor((bpm / 60) * time);
      const onBpm = bpmCounter !== bpmCount;
      bpmCounter = bpmCount;

      view.tick(time);
      if (onBpm) {
        const url0 = inputImgs.current[bpmCounter % inputImgs.current.length];
        const url1 =
          inputImgs.current[(bpmCounter + 1) % inputImgs.current.length];

        if (url0 && url1) view.update([url0, url1], camera);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    loop();
  }, []);

  return (
    <div>
      <label htmlFor="file-interface">open</label>
      <input
        id="file-interface"
        type="file"
        multiple
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <div style={{ position: "relative", width: "50vw", height: "50vh" }}>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      {/*<div>
        <img
          key={previewIndex}
          src={previews[previewIndex]}
          className={"scale-in-0"}
          style={{
            width: "100%",
            maxWidth: 500,
          }}
        />
      </div>*/}
      <button onClick={handleSubmit}>submit</button>
    </div>
  );
}
