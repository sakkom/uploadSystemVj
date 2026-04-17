//0417 これはlive用システムpollの観点からpassword保護すべし。

"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [images, setImages] = useState<string[]>([]);
  const allImages = useRef<string[]>([]);
  const isInitialized = useRef(false);

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

  return (
    <div>
      {images.map((url, i) => (
        <p key={i}>{url}</p>
      ))}
    </div>
  );
}
