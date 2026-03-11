"use client";

import { useState } from "react";
import { RichTextEditor } from "@/lib";

export default function ComponentDemoPage() {
  const [editorData, setEditorData] = useState({
    html: "<p>Hello from component mode.</p>",
    text: "Hello from component mode.",
    wordCount: 4,
    pageCount: 1,
  });

  return (
    <main style={{ padding: "24px", display: "grid", gap: "18px" }}>
      <section
        style={{
          border: "1px solid #d9e2ec",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <RichTextEditor
          value={editorData.html}
          onChange={setEditorData}
        />
      </section>

      <section
        style={{
          border: "1px solid #d9e2ec",
          borderRadius: "16px",
          padding: "18px",
          background: "#fff",
        }}
      >
        <strong>Component output</strong>
        <pre
          style={{
            marginTop: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(editorData, null, 2)}
        </pre>
      </section>
    </main>
  );
}
