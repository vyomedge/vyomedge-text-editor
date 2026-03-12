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
import { useWebSocket } from "@/hooks/useWebSocket";
import { createApiClient } from "@/utils/api";
import "@/styles/editor.css";

export default function EditorShell({
  apiBaseUrl = "",
  initialDocId = null,
  embedMode = false,
}) {
  const apiClientRef = useRef(createApiClient(apiBaseUrl));
  const {
    title,
    setTitle,
    wordCount,
    pageCount,
    isDark,
    toggleDark,
    editorRef,
    currentDocId,
    setCurrentDocId,
    updateWordCount,
    getContent,
    onContentChange,
    loadContent,
  } = useEditor();

  const { wsStatus, saveStatus, sendAutoSave } = useWebSocket(
    currentDocId,
    apiBaseUrl,
  );

  const [showFindBar, setShowFindBar] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState({
    show: false,
    x: 0,
    y: 0,
  });
  const [activeModal, setActiveModal] = useState(null);
  const [status, setStatus] = useState("");
  const [manualSaveStatus, setManualSaveStatus] = useState("");
  const autoSaveTimer = useRef(null);
  const postMessageTimer = useRef(null);
  const titleRef = useRef(title);
  titleRef.current = title;

  useEffect(() => {
    apiClientRef.current = createApiClient(apiBaseUrl);
  }, [apiBaseUrl]);

  const showStatus = useCallback((message) => {
    setStatus(message);
    setTimeout(() => setStatus(""), 2500);
  }, []);

  const postEditorData = useCallback(
    (html) => {
      if (!embedMode || typeof window === "undefined" || window.parent === window) {
        return;
      }

      window.parent.postMessage(
        {
          type: "custom-text-editor:data",
          payload: {
            title: titleRef.current || "Untitled Document",
            html,
            wordCount,
            documentId: currentDocId,
          },
        },
        "*",
      );
    },
    [embedMode, wordCount, currentDocId],
  );

  useEffect(() => {
    postEditorData(getContent());
  }, [postEditorData, getContent]);

  useEffect(() => {
    if (!embedMode || typeof window === "undefined") {
      return;
    }

    function handleParentMessage(event) {
      const message = event.data;
      if (!message || typeof message !== "object") {
        return;
      }

      if (message.type === "custom-text-editor:set-data") {
        const payload = message.payload || {};
        const nextHtml =
          typeof payload.html === "string" ? payload.html : getContent();
        const nextTitle =
          typeof payload.title === "string" && payload.title.trim()
            ? payload.title
            : titleRef.current;

        loadContent(nextHtml || "");
        onContentChange(nextHtml || "");
        updateWordCount();
        setTitle(nextTitle || "Untitled Document");
        postEditorData(nextHtml || "");
        showStatus("Content updated");
        return;
      }

      if (message.type === "custom-text-editor:set-html") {
        const html =
          typeof message.payload?.html === "string" ? message.payload.html : "";

        loadContent(html);
        onContentChange(html);
        updateWordCount();
        postEditorData(html);
        showStatus("Content updated");
      }
    }

    window.addEventListener("message", handleParentMessage);
    return () => window.removeEventListener("message", handleParentMessage);
  }, [
    embedMode,
    getContent,
    loadContent,
    onContentChange,
    postEditorData,
    setTitle,
    showStatus,
    updateWordCount,
  ]);

  const handleNewDoc = useCallback(async () => {
    try {
      const res = await apiClientRef.current.createDocument({
        title: "Untitled Document",
        html: "",
      });
      setCurrentDocId(res.data._id);
      setTitle(res.data.title);
      loadContent("");
      showStatus("New document created");
    } catch (err) {
      showStatus("Failed to create document: " + err.message);
    }
  }, [setCurrentDocId, setTitle, loadContent, showStatus]);

  const handleLoadDoc = useCallback(
    async (id) => {
      try {
        const res = await apiClientRef.current.getDocument(id);
        setCurrentDocId(res.data._id);
        setTitle(res.data.title || "Untitled Document");
        loadContent(res.data.html || "");
        showStatus("Document loaded");
      } catch (err) {
        showStatus("Failed to load document: " + err.message);
      }
    },
    [setCurrentDocId, setTitle, loadContent, showStatus],
  );

  useEffect(() => {
    if (initialDocId) {
      handleLoadDoc(initialDocId);
    }
  }, [initialDocId, handleLoadDoc]);

  const handleSaveDoc = useCallback(async () => {
    if (!currentDocId) {
      try {
        const res = await apiClientRef.current.createDocument({
          title: title || "Untitled Document",
          html: getContent(),
        });
        setCurrentDocId(res.data._id);
        setManualSaveStatus("Saved ✓");
        setTimeout(() => setManualSaveStatus(""), 3000);
        return;
      } catch (err) {
        showStatus("Save failed: " + err.message);
        return;
      }
    }
    try {
      setManualSaveStatus("Saving...");
      await apiClientRef.current.saveDocument(currentDocId, {
        title: title || "Untitled Document",
        html: getContent(),
        versionLabel: `Manual save - ${new Date().toLocaleTimeString()}`,
      });
      setManualSaveStatus("Saved ✓");
      setTimeout(() => setManualSaveStatus(""), 3000);
    } catch (err) {
      setManualSaveStatus("Save failed");
      showStatus("Save failed: " + err.message);
    }
  }, [currentDocId, title, getContent, setCurrentDocId, showStatus]);

  const handleDeleteDoc = useCallback(async () => {
    if (!currentDocId) return;
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      await apiClientRef.current.deleteDocument(currentDocId);
      setCurrentDocId(null);
      setTitle("Untitled Document");
      loadContent("");
      showStatus("Document deleted");
    } catch (err) {
      showStatus("Delete failed: " + err.message);
    }
  }, [currentDocId, setCurrentDocId, setTitle, loadContent, showStatus]);

  const handleContentChange = useCallback(
    (html) => {
      onContentChange(html);
      clearTimeout(postMessageTimer.current);
      postMessageTimer.current = setTimeout(() => {
        postEditorData(html);
      }, 250);
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        if (currentDocId) {
          sendAutoSave(html, titleRef.current);
        }
      }, 800);
    },
    [onContentChange, currentDocId, sendAutoSave, postEditorData],
  );

  const handleTitleChange = useCallback(
    (newTitle) => {
      setTitle(newTitle);
      postEditorData(getContent());
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        if (currentDocId) {
          sendAutoSave(getContent(), newTitle);
        }
      }, 800);
    },
    [setTitle, currentDocId, sendAutoSave, getContent, postEditorData],
  );

  return (
    <div
      className={`editor-app ${isDark ? "dark" : ""} ${embedMode ? "embedded-editor" : ""}`}
    >
      <Header />
      <div className="editor-body">
        <div className="editor-main">
          <EditorToolbar onOpenModal={setActiveModal} editorRef={editorRef} />
          {showFindBar && (
            <FindBar
              editorRef={editorRef}
              onClose={() => setShowFindBar(false)}
            />
          )}
          <EditorContent
            ref={editorRef}
            pageCount={pageCount}
            onContentChange={handleContentChange}
            updateWordCount={updateWordCount}
            setFloatingToolbar={setFloatingToolbar}
          />
        </div>
      </div>
      <div className="editor-powered-by">Powered by Vyomedge</div>
      {floatingToolbar.show && (
        <FloatingToolbar
          position={{ x: floatingToolbar.x, y: floatingToolbar.y }}
          onOpenModal={setActiveModal}
          editorRef={editorRef}
        />
      )}
      {activeModal === "link" && (
        <LinkModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {activeModal === "image" && (
        <ImageModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
          apiBaseUrl={apiBaseUrl}
        />
      )}
      {activeModal === "table" && (
        <TableModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {activeModal === "video" && (
        <VideoModal
          onClose={() => setActiveModal(null)}
          editorRef={editorRef}
          showStatus={showStatus}
        />
      )}
      {activeModal === "button" && (
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
