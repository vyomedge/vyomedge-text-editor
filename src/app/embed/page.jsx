import EditorShell from "@/components/Editor/EditorShell";

export default function EmbedPage({ searchParams }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const initialDocId = searchParams?.docId || null;

  return (
    <EditorShell
      apiBaseUrl={apiBaseUrl}
      initialDocId={initialDocId}
      embedMode
    />
  );
}
