"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/hooks/useSelection";

export default function ImageModal({
  onClose,
  editorRef,
  showStatus,
}) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState("");
  const [align, setAlign] = useState("block;margin:8px auto");
  const [encoding, setEncoding] = useState(false);
  const [imageWidth, setImageWidth] = useState(400);
  const [preview, setPreview] = useState(null);
  const { saveSelection, restoreSelection } = useSelection();

  useEffect(() => {
    saveSelection();
  }, [saveSelection]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (url.trim()) {
      setPreview(url.trim());
      return;
    }

    setPreview(null);
  }, [file, url]);

  const buildStyle = (width, alignment) =>
    [
      `display:${alignment}`,
      `width:${width}px`,
      "max-width:100%",
      "height:auto",
      "border-radius:4px",
    ].join(";");

  const insertImage = (src, altText, alignment, width) => {
    editorRef.current?.focus();
    restoreSelection();
    const html = `<img src="${src}" alt="${altText}" style="${buildStyle(width, alignment)}" />`;
    document.execCommand("insertHTML", false, html);
  };

  const fileToBase64 = (imageFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(imageFile);
    });

  const convertToInlineImage = async (imageFile) => {
    const base64 = await fileToBase64(imageFile);

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (img.width <= 1200 && imageFile.size <= 2 * 1024 * 1024) {
          resolve(base64);
          return;
        }

        const scale = Math.min(1200 / img.width, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas is not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(
          canvas.toDataURL(
            "image/jpeg",
            imageFile.size > 2 * 1024 * 1024 ? 0.75 : 0.9,
          ),
        );
      };

      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = base64;
    });
  };

  const handleInsert = async () => {
    const altText = alt.trim() || "image";
    const width = Math.max(50, Math.min(imageWidth, 2000));

    if (file) {
      setEncoding(true);
      try {
        const inlineSrc = await convertToInlineImage(file);
        insertImage(inlineSrc, altText, align, width);
        showStatus("Image embedded as base64");
        onClose();
      } catch (err) {
        showStatus("Image conversion failed: " + err.message);
      } finally {
        setEncoding(false);
      }
      return;
    }

    if (url.trim()) {
      insertImage(url.trim(), altText, align, width);
      showStatus("Image inserted");
      onClose();
      return;
    }

    showStatus("Please choose an image or enter a URL");
  };

  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target.classList.contains("modal-bg") && onClose()}
    >
      <div className="modal">
        <h3>Insert Image</h3>

        <label>Image URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (e.target.value) setFile(null);
          }}
          placeholder="https://..."
        />

        <label>Or upload file as inline base64</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
            if (selectedFile) setUrl("");
          }}
        />

        {preview && (
          <div className="image-preview">
            <img
              src={preview}
              alt="Preview"
              style={{
                width: `${imageWidth}px`,
                maxWidth: "100%",
                height: "auto",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        {encoding && (
          <div style={{ margin: "8px 0", fontSize: "12px", color: "var(--muted)" }}>
            Converting image to inline base64...
          </div>
        )}

        <label>Alt text</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image"
        />

        <label
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Width</span>
          <span style={{ fontWeight: 600, color: "var(--accent)" }}>
            {imageWidth}px
          </span>
        </label>
        <input
          type="range"
          min={50}
          max={1200}
          step={10}
          value={imageWidth}
          onChange={(e) => setImageWidth(Number(e.target.value))}
          style={{ width: "100%" }}
        />

        <label>Alignment</label>
        <select value={align} onChange={(e) => setAlign(e.target.value)}>
          <option value="block;margin:8px auto">Center</option>
          <option value="block;margin:8px 0">Left</option>
          <option value="block;margin:8px 0 8px auto">Right</option>
        </select>

        <div className="modal-btns">
          <button className="btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleInsert}
            disabled={encoding}
          >
            {encoding ? "Converting..." : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );
}
