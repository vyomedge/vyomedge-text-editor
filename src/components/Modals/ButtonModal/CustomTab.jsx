// components/Modals/ButtonModal/CustomTab.jsx
"use client";

const BG_SWATCHES = [
  "#1a73e8",
  "#e63946",
  "#2ecc71",
  "#ff6b35",
  "#8e44ad",
  "#c0392b",
  "#333333",
  "#f39c12",
  "#00b4d8",
  "#ff0054",
  "#1a1a2e",
  "#ffffff",
];
const TXT_SWATCHES = [
  "#ffffff",
  "#000000",
  "#1a73e8",
  "#e63946",
  "#2ecc71",
  "#333333",
];

export default function CustomTab({
  label,
  setLabel,
  url,
  setUrl,
  icon,
  setIcon,
  bg,
  setBg,
  textColor,
  setTextColor,
  style,
  setStyle,
  shape,
  setShape,
  size,
  setSize,
  blank,
  setBlank,
  align,
  setAlign,
  action,
  setAction,
  actionVal,
  setActionVal,
}) {
  return (
    <div>
      <label>Button label</label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Click me"
      />

      <label>Link URL</label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com or #section"
        style={{
          display: action === "link" || action === "scroll" ? "block" : "none",
        }}
      />

      <label>Icon (emoji, optional)</label>
      <input
        type="text"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        placeholder="🛒  🚀  ✉  ▶"
        style={{ width: "120px" }}
      />

      <label>Background color</label>
      <div className="color-swatch-row">
        {BG_SWATCHES.map((color) => (
          <div
            key={color}
            className={`cswatch ${color === bg ? "sel" : ""}`}
            style={{
              background: color,
              border:
                color === "#ffffff"
                  ? "2px solid #ccc"
                  : color === bg
                    ? "2px solid var(--text)"
                    : "2px solid transparent",
            }}
            onClick={() => setBg(color)}
            title={color}
          />
        ))}
      </div>

      <label>Text color</label>
      <div className="color-swatch-row">
        {TXT_SWATCHES.map((color) => (
          <div
            key={color}
            className={`cswatch ${color === textColor ? "sel" : ""}`}
            style={{
              background: color,
              border:
                color === "#ffffff"
                  ? "2px solid #ccc"
                  : color === textColor
                    ? "2px solid var(--text)"
                    : "2px solid transparent",
            }}
            onClick={() => setTextColor(color)}
            title={color}
          />
        ))}
      </div>

      <label>Style</label>
      <select value={style} onChange={(e) => setStyle(e.target.value)}>
        <option value="solid">Solid (filled)</option>
        <option value="outline">Outline</option>
        <option value="ghost">Ghost / Text link</option>
      </select>

      <label>Shape</label>
      <select value={shape} onChange={(e) => setShape(e.target.value)}>
        <option value="">Rounded corners</option>
        <option value="pill">Pill</option>
      </select>

      <label>Size</label>
      <select value={size} onChange={(e) => setSize(e.target.value)}>
        <option value="sm">Small</option>
        <option value="">Medium</option>
        <option value="lg">Large</option>
        <option value="full">Full Width</option>
      </select>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        <input
          type="checkbox"
          checked={blank}
          onChange={(e) => setBlank(e.target.checked)}
        />
        Open in new tab
      </label>

      <label>Alignment</label>
      <select value={align} onChange={(e) => setAlign(e.target.value)}>
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <label>On-click action</label>
      <select value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="link">Navigate to URL</option>
        <option value="scroll">Scroll to section ID</option>
        <option value="mailto">Send email</option>
        <option value="tel">Phone call</option>
        <option value="copy">Copy text to clipboard</option>
        <option value="alert">Show alert message</option>
      </select>

      <input
        type="text"
        value={actionVal}
        onChange={(e) => setActionVal(e.target.value)}
        placeholder={
          action === "link"
            ? "https://..."
            : action === "scroll"
              ? "#section-id"
              : action === "mailto"
                ? "email@example.com"
                : action === "tel"
                  ? "+1234567890"
                  : action === "copy"
                    ? "Text to copy"
                    : "Message to show"
        }
        style={{
          marginTop: "0",
          display: action !== "link" ? "block" : "none",
        }}
      />
    </div>
  );
}
