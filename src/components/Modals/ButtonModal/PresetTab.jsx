// components/Modals/ButtonModal/PresetTab.jsx
"use client";

const PRESETS = [
  {
    label: "Call to Action",
    text: "Get Started",
    bg: "#1a73e8",
    tc: "#fff",
    shape: "",
    size: "",
    icon: "🚀",
    desc: "Primary CTA",
  },
  {
    label: "Buy Now",
    text: "Buy Now",
    bg: "#e63946",
    tc: "#fff",
    shape: "pill",
    size: "lg",
    icon: "🛒",
    desc: "E-commerce",
  },
  {
    label: "Learn More",
    text: "Learn More",
    bg: "transparent",
    tc: "#1a73e8",
    shape: "",
    size: "",
    icon: "",
    desc: "Soft CTA",
  },
  {
    label: "Download",
    text: "Download Free",
    bg: "#2ecc71",
    tc: "#fff",
    shape: "",
    size: "",
    icon: "⬇",
    desc: "Lead gen",
  },
  {
    label: "Subscribe",
    text: "Subscribe",
    bg: "#ff6b35",
    tc: "#fff",
    shape: "pill",
    size: "",
    icon: "✉",
    desc: "Email/Newsletter",
  },
  {
    label: "Contact Us",
    text: "Contact Us",
    bg: "#333",
    tc: "#fff",
    shape: "",
    size: "",
    icon: "💬",
    desc: "Support",
  },
  {
    label: "Watch Video",
    text: "Watch Video",
    bg: "#c0392b",
    tc: "#fff",
    shape: "pill",
    size: "",
    icon: "▶",
    desc: "Media",
  },
  {
    label: "Sign Up Free",
    text: "Sign Up Free",
    bg: "#8e44ad",
    tc: "#fff",
    shape: "pill",
    size: "lg",
    icon: "⚡",
    desc: "SaaS",
  },
  {
    label: "Back to Top",
    text: "Back to Top",
    bg: "#555",
    tc: "#fff",
    shape: "",
    size: "sm",
    icon: "↑",
    desc: "Navigation",
  },
];

export default function PresetTab({
  selectedPreset,
  setSelectedPreset,
  label,
  setLabel,
  url,
  setUrl,
  blank,
  setBlank,
  align,
  setAlign,
}) {
  return (
    <div>
      <div className="preset-grid">
        {PRESETS.map((preset, index) => (
          <div
            key={index}
            className={`preset-item ${index === selectedPreset ? "selected" : ""}`}
            onClick={() => {
              setSelectedPreset(index);
              setLabel(preset.text);
            }}
          >
            <div
              style={{
                background:
                  preset.bg === "transparent" ? "transparent" : preset.bg,
                color: preset.tc,
                padding: "5px 8px",
                borderRadius: preset.shape === "pill" ? "50px" : "5px",
                fontSize: "12px",
                fontWeight: "600",
                display: "inline-block",
                border:
                  preset.bg === "transparent"
                    ? `2px solid ${preset.tc}`
                    : "none",
              }}
            >
              {preset.icon && `${preset.icon} `}
              {preset.text}
            </div>
            <span>{preset.desc}</span>
          </div>
        ))}
      </div>

      <label>Button label</label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Get Started"
      />

      <label>Link URL</label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />

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
    </div>
  );
}
