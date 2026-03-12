"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header/Header.jsx";
import EditorToolbar from "@/components/Editor/EditorToolbar";
import EditorContent from "@/components/Editor/EditorContent";
import FloatingToolbar from "@/components/Editor/FloatingToolbar";
import FindBar from "@/components/FindReplace/FindBar";
import StatusToast from "@/components/common/StatusToast";
import LinkModal from "@/components/Modals/LinkModal";
import ImageModal from "@/components/Modals/ImageModal";
import TableModal from "@/components/Modals/TableModal";
import VideoModal from "@/components/Modals/VideoModal";
import ButtonModal from "@/components/Modals/ButtonModal/ButtonModal";
import { useEditor } from "@/hooks/useEditor";
import { getPageCount } from "@/utils/metrics";
import "@/styles/editor.css";

const PAGE_HEIGHT = 1122;

function getMetrics(editorElement, html) {
  const text = editorElement?.innerText?.trim() || "";
  return {
    html,
    text,
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
    pageCount: getPageCount(editorElement, PAGE_HEIGHT),
  };
}

export default function RichTextEditor({
  value,
  defaultValue = "",
  onChange,
  onReady,
  readOnly = false,
  className = "",
}) {
  const {
    wordCount,
    pageCount,
    editorRef,
    updateWordCount,
    getContent,
    onContentChange,
    loadContent,
  } = useEditor();

  const [showFindBar, setShowFindBar] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState({
    show: false,
    x: 0,
    y: 0,
  });
  const [activeModal, setActiveModal] = useState(null);
  const [status, setStatus] = useState("");
  const hasInitializedValue = useRef(false);

  const showStatus = useCallback((message) => {
    setStatus(message);
    setTimeout(() => setStatus(""), 2500);
  }, []);

  useEffect(() => {
    if (typeof onReady === "function") {
      onReady({
        getHtml: () => getContent(),
        focus: () => editorRef.current?.focus(),
        setHtml: (html) => loadContent(html || ""),
      });
    }
  }, [onReady, getContent, loadContent, editorRef]);

  useEffect(() => {
    if (value === undefined) return;
    if (!hasInitializedValue.current || value !== getContent()) {
      loadContent(value || "");
      hasInitializedValue.current = true;
    }
  }, [value, loadContent, getContent]);

  const emitChange = useCallback(
    (html) => {
      if (typeof onChange !== "function") return;
      const payload = getMetrics(editorRef.current, html);
      onChange(payload);
    },
    [onChange, editorRef],
  );

  const handleContentChange = useCallback(
    (html) => {
      onContentChange(html);
      emitChange(html);
    },
    [onContentChange, emitChange],
  );

  const initialHtml = value !== undefined ? value : defaultValue;

  return (
    <div className={`editor-app ${className}`.trim()}>
      <Header wordCount={wordCount} />
      <div className="editor-body">
        <div className="editor-main">
          {!readOnly && (
            <EditorToolbar onOpenModal={setActiveModal} editorRef={editorRef} />
          )}
          {showFindBar && (
            <FindBar
              editorRef={editorRef}
              onClose={() => setShowFindBar(false)}
            />
          )}
          <EditorContent
            ref={editorRef}
            pageCount={pageCount}
            initialHtml={initialHtml}
            readOnly={readOnly}
            onContentChange={handleContentChange}
            updateWordCount={updateWordCount}
            setFloatingToolbar={setFloatingToolbar}
          />
        </div>
      </div>
      {!readOnly && floatingToolbar.show && (
        <FloatingToolbar
          position={{ x: floatingToolbar.x, y: floatingToolbar.y }}
          onOpenModal={setActiveModal}
          editorRef={editorRef}
        />
      )}
      {!readOnly && activeModal === "link" && (
        <LinkModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {!readOnly && activeModal === "image" && (
        <ImageModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {!readOnly && activeModal === "table" && (
        <TableModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {!readOnly && activeModal === "video" && (
        <VideoModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {!readOnly && activeModal === "button" && (
        <ButtonModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {status && <StatusToast message={status} />}
    </div>
  );
}
