// utils/export.js
export function downloadFile(content, name, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHTML(content, title) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 860px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
    .rte-btn { display: inline-block; padding: 10px 22px; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: 2px solid transparent; transition: opacity .2s; margin: 4px 2px; }
    .rte-btn.pill { border-radius: 50px; }
    .rte-btn.sm { padding: 6px 14px; font-size: 13px; }
    .rte-btn.lg { padding: 14px 30px; font-size: 17px; }
  </style>
</head>
<body>${content}</body>
</html>`;

  downloadFile(html, `${title}.html`, "text/html");
}

export function exportMarkdown(content, title) {
  let md = content;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&nbsp;/g, " ").trim();

  downloadFile(md, `${title}.md`, "text/markdown");
}

export function exportTXT(content, title) {
  downloadFile(content, `${title}.txt`, "text/plain");
}

export function copyHTML(content) {
  navigator.clipboard.writeText(content);
}
