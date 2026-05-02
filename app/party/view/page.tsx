//resource: https://zenn.dev/immedio/articles/98528f2b1b3075
//0417 これはlive用システムpollの観点からpassword保護すべし。

"use client";

import { RefObject, useEffect, useRef, useState } from "react";
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

//60bpm 60beat 60s
// 革新部分ロジックリファクタリングしよう！
const 序破急 = 2;
function getSketchIndex(t: number) {
  // const 一周何秒 = 600; //600で5分で抽象具象が２回、1時間12回の抽象具象
  const 一周何秒 = 100; //600で5分で抽象具象が２回、1時間12回の抽象具象
  let seedTime = t;
  seedTime *= (Math.PI * 2) / 一周何秒;
  seedTime -= Math.PI / 2;
  const 抽象具象 = (seedTime + Math.PI / 2) % (Math.PI * 2) < Math.PI;
  let index = Math.sin(seedTime) * 0.5 + 0.5;
  index *= 序破急;
  index = Math.round(index);

  // console.log(index, 抽象具象);

  return { index, 抽象具象 };
}

const DEV = false;
const loader = new THREE.TextureLoader();

interface 抽象具像interface {
  抽象具象: boolean;
  bpm: number;
  index: number;
  texs: THREE.Texture<HTMLImageElement, THREE.TextureEventMap>[];
  time: number;
}

function randomTexs(texCache: Map<string, THREE.Texture<HTMLImageElement>>) {
  const arr = Array.from(texCache.values());
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Page() {
  const texCache = useRef<Map<string, THREE.Texture<HTMLImageElement>>>(
    new Map(),
  );
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitTex, setIsInitTex] = useState<boolean>(false);
  const initial = getSketchIndex(0);
  const termRef: RefObject<抽象具像interface> = useRef({
    抽象具象: initial.抽象具象,
    bpm: 50,
    index: initial.index,
    texs: [],
    time: 0,
  });

  // useEffect(() => {
  //   const poll = async () => {
  //     if (!rendererRef.current) return;
  //     const res = await fetch("/api/get-images");
  //     //R2の使用上全取得
  //     const { urls } = await res.json();
  //     //ここのロジックで最新の画像をフィードバック
  //     urls.forEach((url: string) => {
  //       if (texCache.current.has(url)) return;
  //       loader.load(url, (tex) => {
  //         rendererRef.current?.initTexture(tex);
  //         texCache.current.set(url, tex);
  //       });
  //     });
  //   };

  //   const interval = setInterval(poll, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    (async () => {
      if (!canvasRef.current) return;
      const { scene, camera, renderer, aspect } = setThree(canvasRef.current);
      rendererRef.current = renderer;
      camera.position.z = 2;

      const init = async () => {
        const res = await fetch("/api/get-images");
        let { urls } = await res.json();
        urls = DEV ? urls.slice(0, 15) : urls;

        await Promise.all(
          urls.map(async (url: string) => {
            if (texCache.current.has(url)) return;
            const tex = await loader.loadAsync(url);
            rendererRef.current?.initTexture(tex);
            texCache.current.set(url, tex);
          }),
        );
      };
      await init();
      //init
      termRef.current.texs = randomTexs(texCache.current);

      setIsInitTex(true);

      const view = imagePreview(scene);
      view.init(aspect, camera, renderer);

      const initLive = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 },
        });
        streamRef.current = stream;
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();
        const liveTex = new THREE.VideoTexture(video);
        view.setLive(liveTex);
      };
      await initLive();

      //bpm test clock
      const timer = new THREE.Timer();
      let bpmCounter = 0;
      let snapCounter = 0;
      let lastTime = 0;
      let frameCount = 0;
      const loop = () => {
        const now = performance.now();
        frameCount++;
        if (now - lastTime >= 1000) {
          // console.log(`fps: ${frameCount}`);
          frameCount = 0;
          lastTime = now;
        }

        timer.update();
        const time = timer.getElapsed();
        view.setTime(time);

        const bpm = 50;

        const { index, 抽象具象 } = getSketchIndex(time);
        if (
          抽象具象 !== termRef.current.抽象具象 ||
          termRef.current.index !== index
        ) {
          termRef.current.bpm = bpm;
          // console.log(termRef.current, { index, 抽象具象 });
          termRef.current.texs = randomTexs(texCache.current);
          // console.log(arr);//重い注意
          termRef.current.抽象具象 = 抽象具象;
          termRef.current.time = 0;
          bpmCounter = 0;
          termRef.current.index = index;
          view.next(index, termRef.current.bpm);
        }
        termRef.current.time += timer.getDelta();

        // const bpmCount = Math.floor((bpm / 60) * time);
        const bpmCount = Math.floor(
          (termRef.current.bpm / 60) * termRef.current.time,
        );
        const snapCount = Math.floor(
          ((termRef.current.bpm * 3) / 60) * termRef.current.time,
        );
        // console.log(bpmCount);
        const onBpm = bpmCounter !== bpmCount;
        bpmCounter = bpmCount;
        const onSnapBpm = snapCounter !== snapCount;
        snapCounter = snapCount;
        // console.log({ bpmCounter, index, term: termRef.current.抽象具象 });

        if (onSnapBpm) {
          view.snap();
        }

        if (onBpm) {
          const tex =
            termRef.current.texs[bpmCount % termRef.current.texs.length];
          if (tex) view.update(tex, bpmCount);
        }
        view.updateTermTime(termRef.current.time);

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {!isInitTex && (
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          .initTexture()
        </p>
      )}
      <canvas ref={canvasRef} />
    </div>
  );
}
