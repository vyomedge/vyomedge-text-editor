"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/hooks/useSelection";

export default function LinkModal({ onClose, editorRef, showStatus }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const { restoreSelection } = useSelection();

  useEffect(() => {
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && !sel.isCollapsed) {
      setText(sel.toString());
    }
  }, []);

  const handleInsert = () => {
    if (!url.trim()) {
      showStatus("Please enter a URL");
      return;
    }

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    const displayText =
      text.trim() || (sel && !sel.isCollapsed ? sel.toString() : url.trim());
    const target = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";

    document.execCommand(
      "insertHTML",
      false,
      `<a href="${url.trim()}"${target}>${displayText}</a>`,
    );

    showStatus("Link inserted");
    onClose();
  };

  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target.classList.contains("modal-bg") && onClose()}
    >
      <div className="modal">
        <h3>Insert Link</h3>
        <p
          style={{
            marginBottom: "14px",
            fontSize: "13px",
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Add a URL and optional display text. If you selected text in the
          editor, it will be used automatically.
        </p>

        <label>Display text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Selected text or custom label"
          autoFocus
        />

        <label>URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            color: "var(--text)",
          }}
        >
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            style={{ width: "16px", height: "16px", margin: 0 }}
          />
          Open in new tab
        </label>

        <div className="modal-btns">
          <button className="btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleInsert}>
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}
