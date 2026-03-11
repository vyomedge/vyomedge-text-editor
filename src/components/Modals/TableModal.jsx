// components/Modals/TableModal.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/hooks/useSelection";

export default function TableModal({ onClose, editorRef, showStatus }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const { saveSelection, restoreSelection } = useSelection();

  useEffect(() => {
    saveSelection();
  }, []);

  const handleInsert = () => {
    let html = "<table><tbody>";

    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        const tag = r === 0 && hasHeader ? "th" : "td";
        html += `<${tag}>&nbsp;</${tag}>`;
      }
      html += "</tr>";
    }

    html += "</tbody></table><p></p>";

    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);

    showStatus("Table inserted");
    onClose();
  };

  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target.classList.contains("modal-bg") && onClose()}
    >
      <div className="modal">
        <h3>Insert Table</h3>

        <label>Rows</label>
        <input
          type="number"
          min="1"
          max="20"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value) || 3)}
        />

        <label>Columns</label>
        <input
          type="number"
          min="1"
          max="10"
          value={cols}
          onChange={(e) => setCols(parseInt(e.target.value) || 3)}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
          />
          Include header row
        </label>

        <div className="modal-btns">
          <button className="btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleInsert}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
