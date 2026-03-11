// components/FindReplace/FindBar.jsx
"use client";

import { useState, useEffect } from "react";

export default function FindBar({ editorRef, onClose }) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [info, setInfo] = useState("");

  const clearHighlights = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
      /<mark class="find-hl"[^>]*>(.*?)<\/mark>/gi,
      "$1",
    );
  };

  const doFind = (searchText) => {
    clearHighlights();
    setMatches([]);

    if (!searchText || !editorRef.current) {
      setInfo("");
      return;
    }

    const regex = new RegExp(
      searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    let count = 0;

    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
      regex,
      (match) => {
        count++;
        return `<mark class="find-hl" style="background:#fce94f;border-radius:2px">${match}</mark>`;
      },
    );

    setInfo(
      count ? `${count} match${count !== 1 ? "es" : ""} found` : "No matches",
    );

    const newMatches = editorRef.current.querySelectorAll("mark.find-hl");
    setMatches(Array.from(newMatches));
    setCurrentIndex(0);

    if (newMatches.length) {
      newMatches[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const findNext = () => {
    if (matches.length === 0) return;
    const newIndex = (currentIndex + 1) % matches.length;
    setCurrentIndex(newIndex);
    matches[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const findPrev = () => {
    if (matches.length === 0) return;
    const newIndex = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(newIndex);
    matches[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const doReplace = () => {
    if (matches.length === 0 || !matches[currentIndex]) return;
    matches[currentIndex].outerHTML = replaceText;
    doFind(findText);
  };

  const doReplaceAll = () => {
    if (!findText || !editorRef.current) return;

    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    editorRef.current.innerHTML = editorRef.current.innerHTML
      .replace(/<mark class="find-hl"[^>]*>.*?<\/mark>/gi, "$&")
      .replace(regex, replaceText);

    doFind(findText);
  };

  useEffect(() => {
    return () => clearHighlights();
  }, []);

  return (
    <div id="find-bar" style={{ display: "block" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <strong style={{ fontSize: "14px" }}>Find & Replace</strong>
        <button
          className="tb-btn"
          onClick={onClose}
          style={{ width: "24px", height: "24px", fontSize: "16px" }}
        >
          ✕
        </button>
      </div>

      <input
        type="text"
        value={findText}
        onChange={(e) => {
          setFindText(e.target.value);
          doFind(e.target.value);
        }}
        placeholder="Find..."
        autoFocus
      />

      <input
        type="text"
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
        placeholder="Replace with..."
      />

      <div className="find-row">
        <button className="find-btn" onClick={findPrev}>
          ◀ Prev
        </button>
        <button className="find-btn" onClick={findNext}>
          Next ▶
        </button>
        <button className="find-btn" onClick={doReplace}>
          Replace
        </button>
        <button className="find-btn" onClick={doReplaceAll}>
          Replace All
        </button>
      </div>

      <div id="find-info">{info}</div>
    </div>
  );
}
