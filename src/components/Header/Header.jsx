"use client";

export default function Header({ wordCount }) {
  return (
    <div className="editor-header">
      <span className="word-count">{wordCount.toLocaleString()} words</span>
    </div>
  );
}
