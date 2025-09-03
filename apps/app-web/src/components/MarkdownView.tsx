type Props = { markdown: string };

// Nota: placeholder simples. Em um app real, use um parser (ex.: remark/marked)
export function MarkdownView({ markdown }: Props) {
  const html = basicMarkdownToHtml(markdown);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function basicMarkdownToHtml(md: string) {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  for (let line of lines) {
    // headings
    if (/^#{1,6} /.test(line)) {
      const level = (line.match(/^#+/)?.[0].length || 1);
      const text = escapeHtml(line.replace(/^#{1,6} /, ""));
      out.push(`<h${level}>${text}</h${level}>`);
      continue;
    }
    // bullets
    if (/^[-*] /.test(line)) {
      // naive: wrap single items; grouping omitted for simplicity
      const text = escapeHtml(line.replace(/^[-*] /, ""));
      out.push(`<ul><li>${text}</li></ul>`);
      continue;
    }
    // emphasis
    line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // code ticks
    line = line.replace(/`([^`]+)`/g, "<code>$1</code>");
    // paragraphs
    const text = escapeHtml(line);
    if (text.trim() === "") {
      out.push("");
    } else {
      out.push(`<p>${text}</p>`);
    }
  }
  return out.join("\n");
}

