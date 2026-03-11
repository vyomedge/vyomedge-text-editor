// components/Modals/ButtonModal/ButtonModal.jsx
"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/hooks/useSelection";
import PresetTab from "./PresetTab";
import CustomTab from "./CustomTab";
import GroupTab from "./GroupTab";
import { buildButtonHTML } from "@/utils/buttonBuilder";

export default function ButtonModal({ onClose, editorRef, showStatus }) {
  const [activeTab, setActiveTab] = useState("presets");
  const [previewHTML, setPreviewHTML] = useState("");
  const { saveSelection, restoreSelection } = useSelection();

  // Preset state
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [presetLabel, setPresetLabel] = useState("Get Started");
  const [presetUrl, setPresetUrl] = useState("");
  const [presetBlank, setPresetBlank] = useState(true);
  const [presetAlign, setPresetAlign] = useState("center");

  // Custom state
  const [customLabel, setCustomLabel] = useState("Button");
  const [customUrl, setCustomUrl] = useState("");
  const [customIcon, setCustomIcon] = useState("");
  const [customBg, setCustomBg] = useState("#1a73e8");
  const [customText, setCustomText] = useState("#ffffff");
  const [customStyle, setCustomStyle] = useState("solid");
  const [customShape, setCustomShape] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customBlank, setCustomBlank] = useState(true);
  const [customAlign, setCustomAlign] = useState("center");
  const [customAction, setCustomAction] = useState("link");
  const [customActionVal, setCustomActionVal] = useState("");

  // Group state
  const [groupButtons, setGroupButtons] = useState([
    {
      label: "Button 1",
      url: "#",
      style: "solid",
      bg: "#1a73e8",
      tc: "#ffffff",
    },
    {
      label: "Button 2",
      url: "#",
      style: "outline",
      bg: "#e63946",
      tc: "#ffffff",
    },
  ]);
  const [groupAlign, setGroupAlign] = useState("center");

  useEffect(() => {
    saveSelection();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [
    activeTab,
    selectedPreset,
    presetLabel,
    presetUrl,
    presetAlign,
    customLabel,
    customUrl,
    customIcon,
    customBg,
    customText,
    customStyle,
    customShape,
    customSize,
    customAlign,
    customAction,
    customActionVal,
    groupButtons,
    groupAlign,
  ]);

  const updatePreview = () => {
    setPreviewHTML(getButtonHTML());
  };

  const getButtonHTML = () => {
    if (activeTab === "presets") {
      return buildPresetHTML();
    } else if (activeTab === "custom") {
      return buildCustomHTML();
    } else if (activeTab === "group") {
      return buildGroupHTML();
    }
    return "";
  };

  const buildPresetHTML = () => {
    const presets = [
      {
        label: "Call to Action",
        text: "Get Started",
        bg: "#1a73e8",
        tc: "#fff",
        shape: "",
        size: "",
        icon: "🚀",
        style: "solid",
      },
      {
        label: "Buy Now",
        text: "Buy Now",
        bg: "#e63946",
        tc: "#fff",
        shape: "pill",
        size: "lg",
        icon: "🛒",
        style: "solid",
      },
      {
        label: "Learn More",
        text: "Learn More",
        bg: "transparent",
        tc: "#1a73e8",
        shape: "",
        size: "",
        icon: "",
        style: "outline",
      },
      {
        label: "Download",
        text: "Download Free",
        bg: "#2ecc71",
        tc: "#fff",
        shape: "",
        size: "",
        icon: "⬇",
        style: "solid",
      },
      {
        label: "Subscribe",
        text: "Subscribe",
        bg: "#ff6b35",
        tc: "#fff",
        shape: "pill",
        size: "",
        icon: "✉",
        style: "solid",
      },
      {
        label: "Contact Us",
        text: "Contact Us",
        bg: "#333",
        tc: "#fff",
        shape: "",
        size: "",
        icon: "💬",
        style: "solid",
      },
      {
        label: "Watch Video",
        text: "Watch Video",
        bg: "#c0392b",
        tc: "#fff",
        shape: "pill",
        size: "",
        icon: "▶",
        style: "solid",
      },
      {
        label: "Sign Up Free",
        text: "Sign Up Free",
        bg: "#8e44ad",
        tc: "#fff",
        shape: "pill",
        size: "lg",
        icon: "⚡",
        style: "solid",
      },
      {
        label: "Back to Top",
        text: "Back to Top",
        bg: "#555",
        tc: "#fff",
        shape: "",
        size: "sm",
        icon: "↑",
        style: "solid",
      },
    ];

    const preset = presets[selectedPreset];
    const html = buildButtonHTML({
      text: presetLabel,
      icon: preset.icon,
      bg: preset.bg,
      tc: preset.tc,
      style: preset.style,
      shape: preset.shape,
      size: preset.size,
      href: presetUrl || "#",
      blank: presetBlank,
      action: "link",
    });

    return `<p style="text-align:${presetAlign}">${html}</p>`;
  };

  const buildCustomHTML = () => {
    const html = buildButtonHTML({
      text: customLabel,
      icon: customIcon,
      bg: customBg,
      tc: customText,
      style: customStyle,
      shape: customShape,
      size: customSize,
      href: customUrl || "#",
      blank: customBlank,
      action: customAction,
      actionVal: customActionVal,
    });

    return `<p style="text-align:${customAlign}">${html}</p>`;
  };

  const buildGroupHTML = () => {
    const buttons = groupButtons
      .map((btn) =>
        buildButtonHTML({
          text: btn.label,
          icon: "",
          bg: btn.bg,
          tc: btn.tc,
          style: btn.style,
          shape: "",
          size: "",
          href: btn.url || "#",
          blank: true,
          action: "link",
        }),
      )
      .join("");

    return `<div class="rte-btn-group" style="justify-content:${groupAlign}">${buttons}</div>`;
  };

  const handleInsert = () => {
    const html = getButtonHTML();
    if (!html) {
      onClose();
      return;
    }

    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html + "<p></p>");

    showStatus("Button inserted!");
    onClose();
  };

  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target.classList.contains("modal-bg") && onClose()}
    >
      <div className="modal">
        <h3>Insert Button / CTA</h3>

        {/* Tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "presets" ? "active" : ""}`}
            onClick={() => setActiveTab("presets")}
          >
            Presets
          </button>
          <button
            className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
            onClick={() => setActiveTab("custom")}
          >
            Custom
          </button>
          <button
            className={`tab-btn ${activeTab === "group" ? "active" : ""}`}
            onClick={() => setActiveTab("group")}
          >
            Button Group
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "presets" && (
          <PresetTab
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            label={presetLabel}
            setLabel={setPresetLabel}
            url={presetUrl}
            setUrl={setPresetUrl}
            blank={presetBlank}
            setBlank={setPresetBlank}
            align={presetAlign}
            setAlign={setPresetAlign}
          />
        )}

        {activeTab === "custom" && (
          <CustomTab
            label={customLabel}
            setLabel={setCustomLabel}
            url={customUrl}
            setUrl={setCustomUrl}
            icon={customIcon}
            setIcon={setCustomIcon}
            bg={customBg}
            setBg={setCustomBg}
            textColor={customText}
            setTextColor={setCustomText}
            style={customStyle}
            setStyle={setCustomStyle}
            shape={customShape}
            setShape={setCustomShape}
            size={customSize}
            setSize={setCustomSize}
            blank={customBlank}
            setBlank={setCustomBlank}
            align={customAlign}
            setAlign={setCustomAlign}
            action={customAction}
            setAction={setCustomAction}
            actionVal={customActionVal}
            setActionVal={setCustomActionVal}
          />
        )}

        {activeTab === "group" && (
          <GroupTab
            buttons={groupButtons}
            setButtons={setGroupButtons}
            align={groupAlign}
            setAlign={setGroupAlign}
          />
        )}

        {/* Preview */}
        <div className="btn-preview-wrap" style={{ marginTop: "12px" }}>
          <div className="btn-preview-label">Preview</div>
          <div
            className="btn-preview-area"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>

        <div className="modal-btns">
          <button className="btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleInsert}>
            Insert Button
          </button>
        </div>
      </div>
    </div>
  );
}
