import { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

type Props = { markdown: string };

export function MarkdownView({ markdown }: Props) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const file = await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .process(markdown);
        if (!cancelled) setHtml(String(file));
      } catch (e) {
        if (!cancelled) setHtml(`<pre>${escapeHtml(markdown)}</pre>`);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

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
