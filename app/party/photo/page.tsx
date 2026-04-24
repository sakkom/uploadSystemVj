"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { previewShader } from "./preview";
import { CHANGE, INTERFACE_ASPECT, SEND } from "./constant";

const SPAN_COUNT =
  typeof window !== "undefined" && window.innerWidth < 768 ? 330 : 1000;

export function setThree(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const WIDTH = canvas.clientWidth;
  const HEIGHT = WIDTH / INTERFACE_ASPECT;
  // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const camera = new THREE.PerspectiveCamera(45, INTERFACE_ASPECT, 0.1, 100);
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
  return { scene, camera, renderer, aspect: INTERFACE_ASPECT };
}

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputImgs = useRef<THREE.Texture[]>([]);
  const [isFile, setIsFile] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  //preview interface design
  const [buttonRatio, setButtonRatio] = useState<number>(0);
  const buttonRatioRef = useRef<number>(0);
  const [changeCount, setChangeCount] = useState<number>();
  //typography
  const [timeState, setTimeState] = useState<number>(0);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      setTimeState(counter);
      counter += 1;
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // const [flush, setFlush] = useState<number>(0);
  // useEffect(() => {
  //   let counter = 0;
  //   const interval = setInterval(() => {
  //     let num = (counter % 1) * previews.length;
  //     setFlush(Math.floor(num));
  //     counter += 0.1;
  //   }, 25);
  //   return () => clearInterval(interval);
  // }, [previews]);

  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      const index = counter % CHANGE.length;
      // const index = counter % 10000;

      setChangeCount(Math.floor(index));
      counter += 1;
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loader = new THREE.TextureLoader();

  //preview interface design
  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      let ratio = counter % 1;
      buttonRatioRef.current = ratio;
      ratio = Math.round(ratio * 10) / 10;
      // console.log(ratio);
      setButtonRatio(ratio);
      counter += 0.1;
    }, 300);
    return () => clearInterval(interval);
  }, []);

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
    setIsSending(true);
    const files = inputRef.current?.files;
    if (!files) return;
    await Promise.all(Array.from(files).map(uploadFile));
    setIsSending(false);
    setIsReady(false);
    setIsDone(true);
    setIsFile(false);
    setTimeout(() => setIsDone(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log(files);
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));

    const promises = urls.map((url) => loader.loadAsync(url));
    Promise.all(promises).then((textures) => {
      inputImgs.current = textures;
      setIsFile(true);
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
    let readySet = false;
    const loop = () => {
      if (inputImgs.current.length === 0) {
        requestAnimationFrame(loop);
        return;
      }
      timer.update();
      const time = timer.getElapsed();
      const bpm = 240;
      const bpmCount = Math.floor((bpm / 60) * time);
      const onBpm = bpmCounter !== bpmCount;
      bpmCounter = bpmCount;

      view.tick(time, buttonRatioRef.current);
      if (onBpm) {
        const url0 = inputImgs.current[bpmCounter % inputImgs.current.length];
        const url1 =
          inputImgs.current[(bpmCounter + 1) % inputImgs.current.length];

        if (url0 && url1) view.update([url0, url1], camera);
      }
      renderer.render(scene, camera);
      if (!readySet) {
        readySet = true;
        setIsLoading(true);
        setTimeout(() => {
          setIsReady(true);
          setIsLoading(false);
        }, 500);
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [isFile]);

  return (
    <div style={{ overflow: "hidden" }}>
      <input
        id="file-interface"
        type="file"
        multiple
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        disabled={isFile ? isDone || !isReady : isDone}
      />
      {!isFile && (
        <div
          style={{
            width: "100vw",
            height: "100dvh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          <label
            htmlFor="file-interface"
            style={{
              cursor: "pointer",
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              padding: "100px",
            }}
          >
            {isDone
              ? "ありがとうございます".split("").map((char, i) => {
                  const letterSpaceValue = Math.floor(
                    (Math.sin(i * 200 + timeState) * 0.5 + 0.5) * 30,
                  );
                  return (
                    <span
                      key={i}
                      style={{ letterSpacing: `${letterSpaceValue}px` }}
                    >
                      {char}
                    </span>
                  );
                })
              : "open".split("").map((char, i) => {
                  const letterSpaceValue = Math.floor(
                    (Math.sin(i * 200 + timeState) * 0.5 + 0.5) * 30,
                  );
                  return (
                    <span
                      key={i}
                      style={{ letterSpacing: `${letterSpaceValue}px` }}
                    >
                      {char}
                    </span>
                  );
                })}
          </label>
        </div>
      )}

      {isFile && !isSending && (
        <div
          style={{
            width: "100vw",
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            userSelect: "none",
            WebkitUserSelect: "none",
            opacity: isReady ? 1 : 0,
          }}
        >
          <div
            className="input_interface"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <>
              <label
                htmlFor="file-interface"
                style={{
                  flex: buttonRatio,
                  overflow: "hidden",
                  wordBreak: "break-all",
                  zIndex: 1,
                  lineHeight: "80px",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {Array.from({ length: SPAN_COUNT }, (_, i) => {
                  const opacityValue = Math.floor(i / CHANGE.length) % 12 === 0;
                  const letterSpacing = Math.floor(
                    (Math.sin(i * 0.1) * 0.5 + 0.5) * 5,
                  );
                  return (
                    <span
                      key={i}
                      style={{
                        opacity: opacityValue ? 0 : 1,
                        fontSize: opacityValue ? "80px" : "15px",
                        display: "inline-block",
                        letterSpacing: `${letterSpacing}px`,
                        transform: `translateY(${(Math.sin(i * 0.1) * 20).toFixed(4)}px)`,
                      }}
                    >
                      {CHANGE[i % CHANGE.length]}
                    </span>
                  );
                })}
              </label>
            </>

            <canvas
              ref={canvasRef}
              style={{
                width: `100%`,
                aspectRatio: `${INTERFACE_ASPECT}`,
                zIndex: 0,
                paddingRight: "20px",
                paddingLeft: "20px",
              }}
            />
            {/*<div>
              <img
                src={previews[flush]}
                style={{ width: "100%", aspectRatio: `${INTERFACE_ASPECT}` }}
              />
            </div>*/}
            <div
              onClick={isReady ? handleSubmit : undefined}
              style={{
                flex: 1 - buttonRatio,
                overflow: "hidden",
                wordBreak: "break-all",
                lineHeight: "80px",
                display: "flex",
                alignContent: "flex-end",
                flexWrap: "wrap",
                position: "relative",
                cursor: "pointer",
                pointerEvents: "all",
              }}
            >
              {Array.from({ length: SPAN_COUNT }, (_, i) => {
                const opacityValue = Math.floor(i / SEND.length) % 12 === 0;
                const letterSpacing = Math.floor(
                  (Math.sin(i * 0.1) * 0.5 + 0.5) * 5,
                );
                return (
                  <span
                    key={i}
                    style={{
                      opacity: opacityValue ? 0 : 1,
                      fontSize: opacityValue ? "80px" : "15px",
                      letterSpacing: `${letterSpacing}px`,
                      display: "inline-block",
                      transform: `translateY(${(Math.sin(i * 0.1) * 20).toFixed(4)}px) `,
                    }}
                  >
                    {SEND[i % SEND.length]}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(isSending || isLoading) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSending
            ? "sending........".split("").map((char, i) => {
                const letterSpaceValue = Math.floor(
                  (Math.sin(i * 200 + timeState) * 0.5 + 0.5) * 30,
                );
                return (
                  <span
                    key={i}
                    style={{ letterSpacing: `${letterSpaceValue}px` }}
                  >
                    {char}
                  </span>
                );
              })
            : "loading........".split("").map((char, i) => {
                const letterSpaceValue = Math.floor(
                  (Math.sin(i * 200 + timeState) * 0.5 + 0.5) * 30,
                );
                return (
                  <span
                    key={i}
                    style={{ letterSpacing: `${letterSpaceValue}px` }}
                  >
                    {char}
                  </span>
                );
              })}
        </div>
      )}
    </div>
  );
}
