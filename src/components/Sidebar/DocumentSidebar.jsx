"use client";

export default function DocumentSidebar({
  open,
  documents,
  currentDocId,
  onLoadDoc,
  onNewDoc,
  loading,
}) {
  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    if (diff < 60000) return "just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return Math.floor(diff / 86400000) + "d ago";
  };

  return (
    <div className={`doc-sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-header">
        <h3>Documents</h3>
        <button className="find-btn" onClick={onNewDoc}>
          ＋ New
        </button>
      </div>
      <div className="sidebar-list">
        {loading && <div className="doc-list-empty">Loading…</div>}
        {!loading && documents.length === 0 && (
          <div className="doc-list-empty">No documents yet</div>
        )}
        {documents.map((doc) => (
          <div
            key={doc._id}
            className={`doc-list-item ${doc._id === currentDocId ? "active" : ""}`}
            onClick={() => onLoadDoc(doc._id)}
          >
            <span className="doc-list-title">{doc.title || "Untitled"}</span>
            <span className="doc-list-meta">
              {doc.wordCount || 0} words · {relativeTime(doc.updatedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
