// components/Modals/ButtonModal/GroupTab.jsx
"use client";

export default function GroupTab({ buttons, setButtons, align, setAlign }) {
  const addButton = () => {
    if (buttons.length >= 4) {
      alert("Max 4 buttons in a group");
      return;
    }

    setButtons([
      ...buttons,
      {
        label: `Button ${buttons.length + 1}`,
        url: "#",
        style: "solid",
        bg: "#1a73e8",
        tc: "#ffffff",
      },
    ]);
  };

  const removeButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  return (
    <div>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          marginBottom: "12px",
        }}
      >
        Add up to 4 buttons side by side.
      </p>

      <div id="group-items">
        {buttons.map((btn, index) => (
          <div
            key={index}
            className="group-item"
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "8px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong style={{ fontSize: "13px" }}>Button {index + 1}</strong>
              <button
                className="tb-btn"
                style={{ width: "22px", height: "22px", fontSize: "12px" }}
                onClick={() => removeButton(index)}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={btn.label}
              onChange={(e) => updateButton(index, "label", e.target.value)}
              placeholder="Label"
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                padding: "5px",
                fontSize: "13px",
                marginBottom: "6px",
                background: "var(--surface)",
                color: "var(--text)",
              }}
            />

            <input
              type="text"
              value={btn.url}
              onChange={(e) => updateButton(index, "url", e.target.value)}
              placeholder="URL"
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                padding: "5px",
                fontSize: "13px",
                marginBottom: "6px",
                background: "var(--surface)",
                color: "var(--text)",
              }}
            />

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select
                value={btn.style}
                onChange={(e) => updateButton(index, "style", e.target.value)}
                style={{
                  flex: 1,
                  border: "1px solid var(--border)",
                  borderRadius: "5px",
                  padding: "4px",
                  fontSize: "12px",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
              </select>

              <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                BG
                <input
                  type="color"
                  value={btn.bg}
                  onChange={(e) => updateButton(index, "bg", e.target.value)}
                  style={{
                    marginLeft: "4px",
                    width: "28px",
                    height: "22px",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              </label>

              <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                Text
                <input
                  type="color"
                  value={btn.tc}
                  onChange={(e) => updateButton(index, "tc", e.target.value)}
                  style={{
                    marginLeft: "4px",
                    width: "28px",
                    height: "22px",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        className="find-btn"
        onClick={addButton}
        style={{ marginBottom: "12px" }}
      >
        ＋ Add button
      </button>

      <label>Alignment</label>
      <select value={align} onChange={(e) => setAlign(e.target.value)}>
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </div>
  );
}
