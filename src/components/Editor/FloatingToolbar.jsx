// components/Editor/FloatingToolbar.jsx
"use client";

import { execCommand } from "@/utils/commands";

export default function FloatingToolbar({ position, onOpenModal, editorRef }) {
  return (
    <div
      id="float-toolbar"
      style={{
        display: "flex",
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <button
        className="tb-btn"
        title="Bold"
        onClick={() => execCommand("bold")}
      >
        <b>B</b>
      </button>
      <button
        className="tb-btn"
        title="Italic"
        onClick={() => execCommand("italic")}
      >
        <i>I</i>
      </button>
      <button
        className="tb-btn"
        title="Underline"
        onClick={() => execCommand("underline")}
      >
        <u>U</u>
      </button>
      <button
        className="tb-btn"
        title="Link"
        onClick={() => onOpenModal("link")}
      >
        🔗
      </button>
      <button
        className="tb-btn"
        title="Button/CTA"
        onClick={() => onOpenModal("button")}
        style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)" }}
      >
        BTN
      </button>
    </div>
  );
}
