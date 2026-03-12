import { useState, useRef, useEffect, useCallback } from "react";
import { getPageCount } from "@/utils/metrics";

const APPROX_PAGE_HEIGHT = 1122;

export function useEditor() {
  const [title, setTitle] = useState("Untitled Document");
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const editorRef = useRef(null);
  const contentRef = useRef("");

  const updateWordCount = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const nextPageCount = getPageCount(editorRef.current, APPROX_PAGE_HEIGHT);
    setWordCount(count);
    setPageCount(nextPageCount);
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("editor-theme", next ? "dark" : "light");
      }
      return next;
    });
  };

  const getContent = useCallback(() => {
    return editorRef.current?.innerHTML || contentRef.current;
  }, []);

  const onContentChange = useCallback((html) => {
    contentRef.current = html;
  }, []);

  const loadContent = useCallback(
    (html) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = html || "";
        contentRef.current = html || "";
        updateWordCount();
      }
    },
    [updateWordCount],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("editor-theme");
      if (saved === "dark") setIsDark(true);
    }
  }, []);

  return {
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
  };
}
