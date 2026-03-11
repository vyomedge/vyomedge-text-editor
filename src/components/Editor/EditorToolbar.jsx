// components/Editor/EditorToolbar.jsx
"use client";

import { execCommand } from "@/utils/commands";
import { useState } from "react";
import { useSelection } from "@/hooks/useSelection";

export default function EditorToolbar({ onOpenModal, editorRef }) {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffff00");
  const { saveSelection } = useSelection();

  const handleOpenModal = (event, modalName) => {
    event.preventDefault();
    saveSelection();
    onOpenModal(modalName);
  };

  const handleFormat = (cmd, value = null) => {
    execCommand(cmd, value);
  };

  const handleTextColor = (color) => {
    setTextColor(color);
    execCommand("foreColor", color);
  };

  const handleBgColor = (color) => {
    setBgColor(color);
    execCommand("hiliteColor", color);
  };

  return (
    <div className="editor-toolbar">
      {/* Block Format */}
      <select
        className="tb-select"
        onChange={(e) => {
          handleFormat("formatBlock", e.target.value);
          e.target.blur();
        }}
      >
        <option value="p">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="blockquote">Blockquote</option>
        <option value="pre">Code Block</option>
      </select>

      {/* Font Size */}
      <select
        className="tb-select"
        style={{ width: "58px" }}
        onChange={(e) => {
          handleFormat("fontSize", e.target.value);
          e.target.blur();
        }}
      >
        <option value="">Size</option>
        <option value="1">8pt</option>
        <option value="2">10pt</option>
        <option value="3">12pt</option>
        <option value="4">14pt</option>
        <option value="5">18pt</option>
        <option value="6">24pt</option>
        <option value="7">36pt</option>
      </select>

      <div className="tb-sep"></div>

      {/* Text Formatting */}
      <button
        className="tb-btn"
        title="Bold (Ctrl+B)"
        onClick={() => handleFormat("bold")}
      >
        <b>B</b>
      </button>
      <button
        className="tb-btn"
        title="Italic (Ctrl+I)"
        onClick={() => handleFormat("italic")}
      >
        <i>I</i>
      </button>
      <button
        className="tb-btn"
        title="Underline (Ctrl+U)"
        onClick={() => handleFormat("underline")}
      >
        <u>U</u>
      </button>
      <button
        className="tb-btn"
        title="Strikethrough"
        onClick={() => handleFormat("strikeThrough")}
      >
        <s>S</s>
      </button>
      <button
        className="tb-btn"
        title="Subscript"
        onClick={() => handleFormat("subscript")}
      >
        X₂
      </button>
      <button
        className="tb-btn"
        title="Superscript"
        onClick={() => handleFormat("superscript")}
      >
        X²
      </button>

      <div className="tb-sep"></div>

      {/* Colors */}
      <div className="color-wrap" title="Text Color">
        <button
          className="color-btn"
          onClick={() => document.getElementById("text-color").click()}
        >
          <span style={{ fontSize: "14px", fontWeight: "700" }}>A</span>
          <div className="color-bar" style={{ background: textColor }}></div>
        </button>
        <input
          type="color"
          id="text-color"
          className="color-input"
          value={textColor}
          onChange={(e) => handleTextColor(e.target.value)}
        />
      </div>

      <div className="color-wrap" title="Highlight Color">
        <button
          className="color-btn"
          onClick={() => document.getElementById("bg-color").click()}
        >
          <span style={{ fontSize: "14px" }}>🖊</span>
          <div className="color-bar" style={{ background: bgColor }}></div>
        </button>
        <input
          type="color"
          id="bg-color"
          className="color-input"
          value={bgColor}
          onChange={(e) => handleBgColor(e.target.value)}
        />
      </div>

      <div className="tb-sep"></div>

      {/* Alignment */}
      <button
        className="tb-btn"
        title="Align Left"
        onClick={() => handleFormat("justifyLeft")}
      >
        ⬅
      </button>
      <button
        className="tb-btn"
        title="Align Center"
        onClick={() => handleFormat("justifyCenter")}
      >
        ↔
      </button>
      <button
        className="tb-btn"
        title="Align Right"
        onClick={() => handleFormat("justifyRight")}
      >
        ➡
      </button>
      <button
        className="tb-btn"
        title="Justify"
        onClick={() => handleFormat("justifyFull")}
      >
        ☰
      </button>

      <div className="tb-sep"></div>

      {/* Lists */}
      <button
        className="tb-btn"
        title="Bullet List"
        onClick={() => handleFormat("insertUnorderedList")}
      >
        •≡
      </button>
      <button
        className="tb-btn"
        title="Numbered List"
        onClick={() => handleFormat("insertOrderedList")}
      >
        1≡
      </button>
      <button
        className="tb-btn"
        title="Indent"
        onClick={() => handleFormat("indent")}
      >
        →|
      </button>
      <button
        className="tb-btn"
        title="Outdent"
        onClick={() => handleFormat("outdent")}
      >
        |←
      </button>

      <div className="tb-sep"></div>

      {/* Insert */}
      <button
        className="tb-btn"
        title="Insert Link"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleOpenModal(e, "link")}
      >
        🔗
      </button>
      <button
        className="tb-btn"
        title="Insert Image"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleOpenModal(e, "image")}
      >
        🖼
      </button>
      <button
        className="tb-btn"
        title="Insert Table"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleOpenModal(e, "table")}
      >
        ⊞
      </button>
      <button
        className="tb-btn"
        title="Insert Video Embed"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleOpenModal(e, "video")}
      >
        ▶
      </button>
      <button
        className="tb-btn"
        title="Horizontal Rule"
        onClick={() => handleFormat("insertHorizontalRule")}
      >
        ─
      </button>

      <div className="tb-sep"></div>

      {/* CTA Button */}
      <button
        className="tb-btn-wide"
        title="Insert Button / CTA"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => handleOpenModal(e, "button")}
      >
        ＋ Button
      </button>

      <div className="tb-sep"></div>

      {/* Undo/Redo */}
      <button
        className="tb-btn"
        title="Undo (Ctrl+Z)"
        onClick={() => handleFormat("undo")}
      >
        ↩
      </button>
      <button
        className="tb-btn"
        title="Redo (Ctrl+Y)"
        onClick={() => handleFormat("redo")}
      >
        ↪
      </button>
    </div>
  );
}
