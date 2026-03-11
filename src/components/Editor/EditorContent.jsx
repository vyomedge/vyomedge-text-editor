"use client";

import { forwardRef, useEffect, useRef } from "react";

const DEFAULT_CONTENT = `
<p>Start typing here...</p>`;
const PAGE_HEIGHT = 1122;
const PAGE_GAP = 28;
const BLOCK_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "TD",
  "TH",
  "HR",
  "DIV",
  "SECTION",
  "ARTICLE",
  "FIGURE",
  "HEADER",
  "FOOTER",
]);

function isBlockNode(node) {
  return node?.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.tagName);
}

function saveSelectionOffsets(container) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!container.contains(range.startContainer)) return null;

  const startRange = range.cloneRange();
  startRange.selectNodeContents(container);
  startRange.setEnd(range.startContainer, range.startOffset);

  const endRange = range.cloneRange();
  endRange.selectNodeContents(container);
  endRange.setEnd(range.endContainer, range.endOffset);

  return {
    start: startRange.toString().length,
    end: endRange.toString().length,
  };
}

function restoreSelectionOffsets(container, offsets) {
  if (!offsets) return;

  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let startSet = false;
  let node = walker.nextNode();

  while (node) {
    const nextOffset = currentOffset + node.textContent.length;

    if (!startSet && offsets.start <= nextOffset) {
      range.setStart(node, Math.max(0, offsets.start - currentOffset));
      startSet = true;
    }

    if (offsets.end <= nextOffset) {
      range.setEnd(node, Math.max(0, offsets.end - currentOffset));
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    currentOffset = nextOffset;
    node = walker.nextNode();
  }

  selection.removeAllRanges();
  selection.selectAllChildren(container);
  selection.collapseToEnd();
}

function normalizeEditorRoot(editor) {
  if (!editor) return false;

  const sourceNodes = Array.from(editor.childNodes);
  if (!sourceNodes.length) return false;

  const fragment = document.createDocumentFragment();
  let paragraph = null;
  let changed = false;

  const flushParagraph = () => {
    if (!paragraph) return;
    if (!paragraph.childNodes.length) {
      paragraph = null;
      return;
    }
    fragment.appendChild(paragraph);
    paragraph = null;
  };

  const ensureParagraph = () => {
    if (!paragraph) {
      paragraph = document.createElement("p");
      changed = true;
    }
    return paragraph;
  };

  sourceNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim() && !paragraph) {
        changed = true;
        return;
      }
      ensureParagraph().appendChild(node.cloneNode(true));
      changed = true;
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      changed = true;
      return;
    }

    if (isBlockNode(node)) {
      flushParagraph();
      fragment.appendChild(node.cloneNode(true));
      return;
    }

    if (node.tagName === "BR") {
      ensureParagraph().appendChild(node.cloneNode(true));
      changed = true;
      return;
    }

    ensureParagraph().appendChild(node.cloneNode(true));
    changed = true;
  });

  flushParagraph();

  if (!changed) return false;

  editor.replaceChildren(fragment);
  return true;
}

function isEditorEmpty(editor) {
  if (!editor) return true;
  const html = editor.innerHTML
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .trim();
  return html === "";
}

function placeCaretInside(node) {
  if (!node) return;
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function ensureParagraphRoot(editor) {
  if (!editor || !isEditorEmpty(editor)) return false;

  const paragraph = document.createElement("p");
  paragraph.appendChild(document.createElement("br"));
  editor.replaceChildren(paragraph);
  placeCaretInside(paragraph);
  return true;
}

// ─────────────────────────────────────────────────────────────
// Resize-handle overlay
// ─────────────────────────────────────────────────────────────
const HANDLE_SIZE = 10;
const HANDLE_POSITIONS = ["nw", "ne", "sw", "se"];

function createHandleOverlay(img, onResize) {
  const overlay = document.createElement("div");
  overlay.dataset.resizeOverlay = "1";
  overlay.style.cssText = `
    position:fixed; pointer-events:none; z-index:10000;
    box-sizing:border-box; border:2px solid var(--accent,#6366f1); border-radius:4px;
  `;

  const label = document.createElement("span");
  label.style.cssText = `
    position:absolute; bottom:-22px; left:50%; transform:translateX(-50%);
    background:var(--accent,#6366f1); color:#fff; font-size:11px;
    padding:1px 6px; border-radius:3px; white-space:nowrap; pointer-events:none;
  `;
  overlay.appendChild(label);

  HANDLE_POSITIONS.forEach((pos) => {
    const h = document.createElement("div");
    h.dataset.handle = pos;
    h.style.cssText = `
      position:absolute; width:${HANDLE_SIZE}px; height:${HANDLE_SIZE}px;
      background:var(--accent,#6366f1); border:2px solid #fff; border-radius:50%;
      pointer-events:all; box-sizing:border-box; cursor:${pos}-resize;
      ${pos.includes("n") ? `top:${-HANDLE_SIZE / 2}px;` : `bottom:${-HANDLE_SIZE / 2}px;`}
      ${pos.includes("w") ? `left:${-HANDLE_SIZE / 2}px;` : `right:${-HANDLE_SIZE / 2}px;`}
    `;
    h.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onResize(e, pos);
    });
    overlay.appendChild(h);
  });

  document.body.appendChild(overlay);

  const sync = () => {
    const r = img.getBoundingClientRect();
    overlay.style.left = r.left + "px";
    overlay.style.top = r.top + "px";
    overlay.style.width = r.width + "px";
    overlay.style.height = r.height + "px";
    label.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
  };
  sync();
  return { overlay, sync };
}

// ─────────────────────────────────────────────────────────────
// Drop-indicator: a vertical blue line shown while dragging
// ─────────────────────────────────────────────────────────────
function createDropIndicator() {
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed; width:3px; background:var(--accent,#6366f1);
    border-radius:2px; pointer-events:none; z-index:9998; display:none;
    box-shadow:0 0 6px var(--accent,#6366f1);
  `;
  document.body.appendChild(el);
  return el;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// Return the nearest image in the editor to (cx,cy), with its distance
function findNearestImage(editor, excludeImg, cx, cy) {
  let nearest = null,
    dist = Infinity;
  editor.querySelectorAll("img").forEach((img) => {
    if (img === excludeImg) return;
    const r = img.getBoundingClientRect();
    const d = Math.hypot(
      cx - (r.left + r.width / 2),
      cy - (r.top + r.height / 2),
    );
    if (d < dist) {
      dist = d;
      nearest = img;
    }
  });
  return { nearest, dist };
}

// Given a flex row and a clientX, return the child BEFORE which to insert
function insertionChildInRow(row, clientX) {
  const children = Array.from(row.children);
  for (const child of children) {
    const r = child.getBoundingClientRect();
    if (clientX < r.left + r.width / 2) return child;
  }
  return null; // append at end
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
const EditorContent = forwardRef(
  (
    {
      onContentChange,
      updateWordCount,
      setFloatingToolbar,
      pageCount = 1,
      initialHtml = "",
      readOnly = false,
    },
    ref,
  ) => {
    const initialized = useRef(false);
    const dragState = useRef(null);
    const resizeState = useRef(null);
    const ghost = useRef(null);
    const activeOverlay = useRef(null);
    const rafHandle = useRef(null);
    const dropIndicator = useRef(null);

    useEffect(() => {
      if (!ref.current || initialized.current) return;
      initialized.current = true;
      document.execCommand("defaultParagraphSeparator", false, "p");
      if (!ref.current.innerHTML.trim()) {
        ref.current.innerHTML = initialHtml || DEFAULT_CONTENT;
      }
      normalizeEditorRoot(ref.current);
    }, [ref, initialHtml]);

    // Create the drop indicator once
    useEffect(() => {
      dropIndicator.current = createDropIndicator();
      return () => dropIndicator.current?.remove();
    }, []);

    // Dismiss overlay on outside click
    useEffect(() => {
      const onDocClick = (e) => {
        if (!activeOverlay.current) return;
        const { img, overlay } = activeOverlay.current;
        if (e.target === img || overlay.contains(e.target)) return;
        removeOverlay();
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Keep overlay in sync on scroll/resize
    useEffect(() => {
      const sync = () => activeOverlay.current?.sync();
      window.addEventListener("scroll", sync, true);
      window.addEventListener("resize", sync);
      return () => {
        window.removeEventListener("scroll", sync, true);
        window.removeEventListener("resize", sync);
      };
    }, []);

    const removeOverlay = () => {
      if (activeOverlay.current) {
        activeOverlay.current.overlay.remove();
        activeOverlay.current = null;
      }
    };

    const showResizeOverlay = (img) => {
      removeOverlay();
      const { overlay, sync } = createHandleOverlay(img, (e, corner) =>
        startResize(e, corner, img, sync),
      );
      activeOverlay.current = { overlay, sync, img };
    };

    // MutationObserver: attach drag/resize to every live-img
    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;

      const attach = (img) => {
        if (img.dataset.draggable === "1") return;
        img.dataset.draggable = "1";
        img.style.cursor = "grab";
        img.draggable = false;
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!dragState.current?.moved) showResizeOverlay(img);
        });
        img.addEventListener("mousedown", handleImgMouseDown);
      };

      const obs = new MutationObserver(() => {
        el.querySelectorAll("img[id^='live-img-']").forEach(attach);
        activeOverlay.current?.sync();
      });
      obs.observe(el, { childList: true, subtree: true, attributes: true });
      el.querySelectorAll("img[id^='live-img-']").forEach(attach);
      return () => obs.disconnect();
    }, [ref]);

    // ───────────────────────────────────────────
    // RESIZE
    // ───────────────────────────────────────────
    const startResize = (e, corner, img, syncOverlay) => {
      resizeState.current = {
        corner,
        img,
        syncOverlay,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: img.offsetWidth,
        startHeight: img.offsetHeight,
        aspectRatio: img.offsetWidth / img.offsetHeight,
      };
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    };

    const handleResizeMove = (e) => {
      if (!resizeState.current) return;
      const {
        corner,
        startX,
        startY,
        startWidth,
        aspectRatio,
        img,
        syncOverlay,
      } = resizeState.current;
      const dx = e.clientX - startX,
        dy = e.clientY - startY;
      const delta =
        corner === "se"
          ? (dx + dy) / 2
          : corner === "sw"
            ? (-dx + dy) / 2
            : corner === "ne"
              ? (dx - dy) / 2
              : (-dx - dy) / 2;
      const w = Math.max(40, Math.round(startWidth + delta));
      img.style.width = w + "px";
      img.style.height = Math.max(40, Math.round(w / aspectRatio)) + "px";
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current);
      rafHandle.current = requestAnimationFrame(syncOverlay);
    };

    const handleResizeEnd = () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current);
      resizeState.current = null;
      onContentChange?.(ref.current?.innerHTML);
      updateWordCount?.();
    };

    // ───────────────────────────────────────────
    // DRAG-TO-MOVE  —  mousedown
    // ───────────────────────────────────────────
    const handleImgMouseDown = (e) => {
      if (e.button !== 0 || e.target.dataset.handle) return;
      e.preventDefault();
      e.stopPropagation();

      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();

      // Ghost
      const g = img.cloneNode(true);
      g.style.cssText = `
        position:fixed; pointer-events:none; opacity:0.5; z-index:9999;
        width:${img.offsetWidth}px; height:${img.offsetHeight}px;
        left:${rect.left}px; top:${rect.top}px;
        border:2px dashed var(--accent,#6366f1); border-radius:4px;
        box-shadow:0 8px 24px rgba(0,0,0,.18);
      `;
      document.body.appendChild(g);
      ghost.current = g;

      // Placeholder to hold layout
      const ph = document.createElement("span");
      ph.dataset.imgPlaceholder = "1";
      ph.style.cssText = `display:inline-block;width:${img.offsetWidth}px;height:${img.offsetHeight}px;`;
      img.parentNode.insertBefore(ph, img);
      img.style.display = "none";

      if (activeOverlay.current)
        activeOverlay.current.overlay.style.display = "none";

      dragState.current = {
        img,
        placeholder: ph,
        moved: false,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };

      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    };

    // ───────────────────────────────────────────
    // DRAG-TO-MOVE  —  mousemove
    // Shows drop indicator while dragging
    // ───────────────────────────────────────────
    const handleDragMove = (e) => {
      if (!dragState.current || !ghost.current) return;
      const { offsetX, offsetY, img } = dragState.current;
      ghost.current.style.left = `${e.clientX - offsetX}px`;
      ghost.current.style.top = `${e.clientY - offsetY}px`;
      dragState.current.moved = true;

      const editor = ref.current;
      const di = dropIndicator.current;
      if (!di || !editor) return;

      // Check if hovering near another image → show vertical indicator between images
      const { nearest, dist } = findNearestImage(
        editor,
        img,
        e.clientX,
        e.clientY,
      );

      if (nearest && dist < 150) {
        // Show indicator to left or right of nearest image
        const r = nearest.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const x = e.clientX < mid ? r.left - 4 : r.right - 1;
        di.style.cssText += `; display:block; left:${x}px; top:${r.top}px; height:${r.height}px;`;
      } else {
        di.style.display = "none";
      }
    };

    // ───────────────────────────────────────────
    // DRAG-TO-MOVE  —  mouseup / drop
    // ───────────────────────────────────────────
    const handleDragEnd = (e) => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);

      // Hide drop indicator
      if (dropIndicator.current) dropIndicator.current.style.display = "none";

      if (!dragState.current) return;
      const { img, placeholder, moved } = dragState.current;
      dragState.current = null;

      if (ghost.current) {
        ghost.current.remove();
        ghost.current = null;
      }

      // Not a real drag → treat as click
      if (!moved) {
        img.style.display = "";
        placeholder.remove();
        showResizeOverlay(img);
        return;
      }

      const editor = ref.current;

      // ── Find nearest other image using center-to-center distance ──
      // (img is display:none so it won't interfere)
      const { nearest, dist } = findNearestImage(
        editor,
        img,
        e.clientX,
        e.clientY,
      );
      const MERGE_PX = 150; // px threshold to trigger row merge

      img.style.display = ""; // restore before DOM insertion

      // ── CASE A: Drop near another image (lone or already in a row) ──
      if (nearest && dist < MERGE_PX) {
        const nearestParent = nearest.parentNode;
        const isInRow = nearestParent?.dataset?.imageRow === "1";

        // Style the dragged image for inline flex use
        if (isInRow) {
          // ── A1: Nearest image is already inside a flex row ──
          // Redistribute widths evenly across all images in the row
          const r = nearest.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          if (e.clientX < mid) nearestParent.insertBefore(img, nearest);
          else {
            const next = nearest.nextSibling;
            if (next) nearestParent.insertBefore(img, next);
            else nearestParent.appendChild(img);
          }
          // Recalculate equal widths for all children
          const count = nearestParent.children.length;
          const pct = `calc(${(100 / count).toFixed(1)}% - 8px)`;
          Array.from(nearestParent.children).forEach((child) => {
            child.style.width = pct;
            child.style.height = "auto";
            child.style.margin = "0";
            child.style.display = "block";
            child.style.flexShrink = "0";
            child.style.flexGrow = "0";
          });
        } else {
          // ── A2: Nearest is a standalone image → create a new flex row ──
          // Also reset the nearest image's styles for flex
          nearest.style.display = "inline-block";
          nearest.style.margin = "4px";
          nearest.style.verticalAlign = "middle";

          const row = document.createElement("div");
          row.dataset.imageRow = "1";
          row.style.cssText =
            "display:flex;flex-wrap:nowrap;align-items:flex-start;justify-content:space-between;gap:8px;margin:8px 0;width:100%;";

          // Each image fills ~half the row with a small gap
          [img, nearest].forEach((i) => {
            i.style.width = "calc(50% - 8px)";
            i.style.height = "auto";
            i.style.margin = "0";
            i.style.display = "block";
            i.style.verticalAlign = "";
            i.style.flexShrink = "0";
            i.style.flexGrow = "0";
          });

          const r = nearest.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          if (e.clientX < mid) {
            row.appendChild(img);
            row.appendChild(nearest);
          } else {
            row.appendChild(nearest);
            row.appendChild(img);
          }

          // Find nearest's top-level block ancestor inside editor
          let block = nearestParent;
          while (block && block.parentNode !== editor) block = block.parentNode;

          // Replace the block if it's now empty, otherwise insert row after it
          if (block && block !== editor) {
            if (block.childNodes.length === 0) {
              editor.replaceChild(row, block);
            } else {
              // block still has other content — insert row after it
              const next = block.nextSibling;
              if (next) editor.insertBefore(row, next);
              else editor.appendChild(row);
            }
          } else {
            editor.appendChild(row);
          }
        }
      }

      // ── CASE B: Drop in open space → standalone block with L/C/R alignment ──
      else {
        const editorRect = editor.getBoundingClientRect();
        const relX = e.clientX - editorRect.left;
        const third = editorRect.width / 3;
        const margin =
          relX < third
            ? "8px 0"
            : relX < third * 2
              ? "8px auto"
              : "8px 0 8px auto";

        img.style.display = "block";
        img.style.margin = margin;
        img.style.verticalAlign = "";

        const wrapper = document.createElement("p");
        wrapper.style.cssText = "margin:0;line-height:0;";
        wrapper.appendChild(img);

        // Find caret position at drop point for precise insertion
        let caretNode = null;
        if (document.caretPositionFromPoint) {
          const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
          if (pos) caretNode = pos.offsetNode;
        } else if (document.caretRangeFromPoint) {
          const r = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (r) caretNode = r.startContainer;
        }

        let inserted = false;
        if (caretNode && !placeholder.contains(caretNode)) {
          let block =
            caretNode.nodeType === Node.TEXT_NODE
              ? caretNode.parentNode
              : caretNode;
          while (block.parentNode && block.parentNode !== editor)
            block = block.parentNode;
          editor.insertBefore(wrapper, block);
          inserted = true;
        }
        if (!inserted)
          placeholder.parentNode.insertBefore(wrapper, placeholder);
      }

      placeholder.remove();

      // ── Clean up rows: if a row now has 1 image, unwrap it to a standalone block ──
      //    If a row still has 2+ images, redistribute widths equally ──
      editor.querySelectorAll("div[data-image-row='1']").forEach((row) => {
        const kids = Array.from(row.children);
        if (kids.length === 0) {
          row.remove();
        } else if (kids.length === 1) {
          // Unwrap the lone image back to a standalone block
          const loneImg = kids[0];
          loneImg.style.width = loneImg.dataset.origWidth || "400px";
          loneImg.style.height = "auto";
          loneImg.style.display = "block";
          loneImg.style.margin = "8px 0";
          loneImg.style.flexShrink = "";
          loneImg.style.flexGrow = "";
          const wrapper = document.createElement("p");
          wrapper.style.cssText = "margin:0;line-height:0;";
          wrapper.appendChild(loneImg);
          row.parentNode.insertBefore(wrapper, row);
          row.remove();
        } else {
          // Redistribute widths equally
          const pct = `calc(${(100 / kids.length).toFixed(1)}% - 8px)`;
          kids.forEach((child) => {
            child.style.width = pct;
            child.style.height = "auto";
            child.style.flexShrink = "0";
            child.style.flexGrow = "0";
          });
        }
      });

      // Re-show overlay
      if (activeOverlay.current) {
        activeOverlay.current.overlay.style.display = "";
        activeOverlay.current.sync();
      }

      onContentChange?.(ref.current?.innerHTML);
      updateWordCount?.();
    };

    // ── Standard editor events ──
    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;

      const handleInput = () => {
        ensureParagraphRoot(el);
        const selectionOffsets = saveSelectionOffsets(el);
        const normalized = normalizeEditorRoot(el);
        if (normalized) {
          restoreSelectionOffsets(el, selectionOffsets);
        }
        onContentChange(el.innerHTML);
        updateWordCount();
      };

      const handleKeyDown = (event) => {
        const isTypingKey =
          event.key.length === 1 ||
          event.key === "Enter" ||
          event.key === "Backspace" ||
          event.key === "Delete";

        if (!isTypingKey) return;

        if (event.key === "Backspace" || event.key === "Delete") {
          requestAnimationFrame(() => {
            ensureParagraphRoot(el);
            onContentChange(el.innerHTML);
            updateWordCount();
          });
          return;
        }

        if (isEditorEmpty(el)) {
          ensureParagraphRoot(el);
        }
      };

      const handleMouseUp = () => {
        if (dragState.current || resizeState.current) return;
        updateWordCount();
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setFloatingToolbar({ show: false, x: 0, y: 0 });
          return;
        }
        const range = sel.getRangeAt(0).getBoundingClientRect();
        setFloatingToolbar({
          show: true,
          x: Math.max(8, range.left + range.width / 2 - 80),
          y: range.top + window.scrollY - 44,
        });
      };

      el.addEventListener("input", handleInput);
      el.addEventListener("keydown", handleKeyDown);
      el.addEventListener("blur", handleInput);
      el.addEventListener("mouseup", handleMouseUp);
      el.addEventListener("keyup", updateWordCount);
      return () => {
        el.removeEventListener("input", handleInput);
        el.removeEventListener("keydown", handleKeyDown);
        el.removeEventListener("blur", handleInput);
        el.removeEventListener("mouseup", handleMouseUp);
        el.removeEventListener("keyup", updateWordCount);
      };
    }, [ref, onContentChange, updateWordCount, setFloatingToolbar]);

    return (
      <div className="editor-wrap">
        <div
          ref={ref}
          className="editor-content"
          style={{
            minHeight: `${pageCount * PAGE_HEIGHT + (pageCount - 1) * PAGE_GAP}px`,
          }}
          contentEditable={!readOnly}
          spellCheck
          suppressContentEditableWarning
        />
      </div>
    );
  },
);

EditorContent.displayName = "EditorContent";
export default EditorContent;
