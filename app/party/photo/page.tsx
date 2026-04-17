"use client";

import { useRef, useState } from "react";

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

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
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  return (
    <div>
      <label>
        file select
        <input
          type="file"
          multiple
          ref={inputRef}
          onChange={handleFileChange}
          hidden
        />
      </label>
      <div>
        {previews.map((url, i) => (
          <img key={i} src={url} style={{ width: "100%", maxWidth: 300 }} />
        ))}
      </div>
      <button onClick={handleSubmit}>submit</button>
    </div>
  );
}
