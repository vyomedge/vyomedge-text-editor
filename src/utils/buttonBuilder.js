// utils/buttonBuilder.js
export function buildButtonHTML(opts) {
  const {
    text,
    icon,
    bg,
    tc,
    style,
    shape,
    size,
    href,
    blank,
    action,
    actionVal,
  } = opts;

  const classes = ["rte-btn", shape, size].filter(Boolean).join(" ");
  const target = blank ? ' target="_blank" rel="noopener"' : "";
  const label =
    (icon ? `<span class="btn-icon">${icon}</span>` : "") + (text || "Button");

  let inlineStyle = "";
  if (style === "outline") {
    inlineStyle = `color:${bg};border-color:${bg}`;
  } else if (style === "ghost") {
    inlineStyle = `color:${bg}`;
  } else {
    inlineStyle = `background:${bg};color:${tc};border-color:${bg}`;
  }

  // Action logic
  let onclickAttr = "";
  let finalHref = href || "#";

  if (action === "scroll" && actionVal) {
    finalHref = "#";
    onclickAttr = `onclick="document.querySelector('${actionVal}')?.scrollIntoView({behavior:'smooth'});return false;" `;
  } else if (action === "mailto") {
    finalHref = `mailto:${actionVal || ""}`;
  } else if (action === "tel") {
    finalHref = `tel:${actionVal || ""}`;
  } else if (action === "copy") {
    finalHref = "#";
    onclickAttr = `onclick="navigator.clipboard.writeText('${(actionVal || "").replace(/'/g, "\\'")}');alert('Copied!');return false;" `;
  } else if (action === "alert") {
    finalHref = "#";
    onclickAttr = `onclick="alert('${(actionVal || "").replace(/'/g, "\\'")}');return false;" `;
  }

  return `<a class="${classes}" href="${finalHref}" ${target} ${onclickAttr}style="${inlineStyle}" data-rte-btn="1">${label}</a>`;
}
