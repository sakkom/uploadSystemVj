//resource: https://zenn.dev/immedio/articles/98528f2b1b3075
//0417 これはlive用システムpollの観点からpassword保護すべし。

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { imagePreview } from "./imagePreview";

export function setThree(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
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
  const [images, setImages] = useState<string[]>([]);
  const allImages = useRef<string[]>([]);
  const isInitialized = useRef(false);

  //
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/get-images");
      const { images } = await res.json();
      allImages.current = images.map((img: { url: string }) => img.url);
      setImages([...allImages.current]);
      isInitialized.current = true;
    };
    init();
  }, []);

  useEffect(() => {
    const poll = async () => {
      if (!isInitialized.current) return;
      const res = await fetch("/api/get-images");
      const { images } = await res.json();
      const urls: string[] = images.map((img: { url: string }) => img.url);

      const newImages = urls.filter(
        (url: string) => !allImages.current.includes(url),
      );
      if (newImages.length > 0) {
        allImages.current = [...allImages.current, ...newImages];
        setImages([...allImages.current]);
        //ここに新着表示
      } else {
        //ここにランダム処理
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const { scene, camera, renderer, aspect } = setThree(canvasRef.current);
    camera.position.z = 2;

    const view = imagePreview(scene);
    view.init();

    //bpm test clock
    const timer = new THREE.Timer();
    let bpmCounter = 0;

    const loop = () => {
      if (!isInitialized.current) {
        requestAnimationFrame(loop);
        return;
      }

      timer.update();
      const time = timer.getElapsed();
      const bpm = 120;
      const bpmCount = Math.floor((bpm / 60) * time);
      const onBpm = bpmCounter !== bpmCount;
      bpmCounter = bpmCount;

      if (onBpm) {
        const url =
          allImages.current[
            Math.floor(Math.random() * allImages.current.length)
          ];

        if (url) view.update(url, time, camera);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    loop();
  }, []);

  return (
    <div>
      {/*{images.map((url, i) => (
        <p key={i}>{url}</p>
      ))}*/}
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
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
    </div>
  );
}
