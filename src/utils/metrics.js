const FALLBACK_PAGE_HEIGHT = 1122;

function getNumericStyleValue(style, property) {
  return Number.parseFloat(style?.[property] || "0") || 0;
}

export function getContentHeight(editorElement) {
  if (!editorElement || typeof window === "undefined") {
    return FALLBACK_PAGE_HEIGHT;
  }

  const style = window.getComputedStyle(editorElement);
  const verticalPadding =
    getNumericStyleValue(style, "paddingTop") +
    getNumericStyleValue(style, "paddingBottom");
  const lineHeight =
    getNumericStyleValue(style, "lineHeight") ||
    getNumericStyleValue(style, "fontSize") * 1.7 ||
    24;

  const range = document.createRange();
  range.selectNodeContents(editorElement);
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 || rect.height > 0,
  );

  if (!rects.length) {
    return Math.max(FALLBACK_PAGE_HEIGHT, Math.ceil(verticalPadding + lineHeight));
  }

  const editorRect = editorElement.getBoundingClientRect();
  const contentBottom = rects.reduce((maxBottom, rect) => {
    return Math.max(maxBottom, rect.bottom - editorRect.top);
  }, 0);

  return Math.max(
    FALLBACK_PAGE_HEIGHT,
    Math.ceil(contentBottom + getNumericStyleValue(style, "paddingBottom")),
  );
}

export function getPageCount(editorElement, pageHeight = FALLBACK_PAGE_HEIGHT) {
  return Math.max(1, Math.ceil(getContentHeight(editorElement) / pageHeight));
}
