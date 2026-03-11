import { useCallback } from "react";

let savedSelectionRange = null;

export function useSelection() {
  const saveSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRange = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!savedSelectionRange || typeof window === "undefined") return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange);
  }, []);

  return { saveSelection, restoreSelection };
}
