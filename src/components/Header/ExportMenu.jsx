// components/Header/ExportMenu.jsx
"use client";

import { useEffect, useRef } from "react";
import {
  exportHTML,
  exportMarkdown,
  exportTXT,
  copyHTML,
} from "@/utils/export";

export default function ExportMenu({ title, editorRef, onClose, showStatus }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleExport = (type) => {
    const content = editorRef.current?.innerHTML || "";

    switch (type) {
      case "html":
        exportHTML(content, title);
        showStatus("Exported as HTML");
        break;
      case "markdown":
        exportMarkdown(content, title);
        showStatus("Exported as Markdown");
        break;
      case "txt":
        exportTXT(editorRef.current?.innerText || "", title);
        showStatus("Exported as plain text");
        break;
      case "copy":
        copyHTML(content);
        showStatus("HTML copied to clipboard");
        break;
    }

    onClose();
  };

  return (
    <div ref={menuRef} className="export-menu open">
      <button onClick={() => handleExport("html")}>📄 Export HTML</button>
      <button onClick={() => handleExport("markdown")}>
        📝 Export Markdown
      </button>
      <button onClick={() => handleExport("txt")}>📋 Export Plain Text</button>
      <button onClick={() => handleExport("copy")}>📋 Copy HTML</button>
    </div>
  );
}
