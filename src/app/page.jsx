import EditorShell from "@/components/Editor/EditorShell";

export default function RichTextEditorPage() {
  return <EditorShell apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ""} />;
}
