// components/Modals/VideoModal.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/hooks/useSelection";

export default function VideoModal({ onClose, editorRef, showStatus }) {
  const [url, setUrl] = useState("");
  const { saveSelection, restoreSelection } = useSelection();

  useEffect(() => {
    saveSelection();
  }, []);

  const handleInsert = () => {
    if (!url.trim()) {
      alert("Enter a video URL");
      return;
    }

    // Extract YouTube video ID
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );

    // Extract Vimeo video ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

    let embedSrc = url;

    if (youtubeMatch) {
      embedSrc = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    } else if (vimeoMatch) {
      embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    const html = `
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:12px 0;border-radius:8px">
        <iframe 
          src="${embedSrc}" 
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px" 
          allowfullscreen
        ></iframe>
      </div>
      <p></p>
    `;

    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);

    showStatus("Video embedded");
    onClose();
  };

  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target.classList.contains("modal-bg") && onClose()}
    >
      <div className="modal">
        <h3>Embed Video</h3>

        <label>YouTube or Vimeo URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          autoFocus
        />

        <div className="modal-btns">
          <button className="btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleInsert}>
            Embed
          </button>
        </div>
      </div>
    </div>
  );
}
