import { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSlug from "remark-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { toString } from "mdast-util-to-string";
import Slugger from "github-slugger";
import type { Root, Content, Heading } from "mdast";
import type { Parent } from "unist";
import "../styles/markdown.css";

type Props = { markdown: string };

export function MarkdownView({ markdown }: Props) {
  const [html, setHtml] = useState<string>("");
  const [toc, setToc] = useState<Array<{ depth: number; text: string; slug: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        // Build TOC from headings using the same slug algorithm (GitHub-style)
        const tree = unified().use(remarkParse).parse(markdown) as Root;
        const slugger = new Slugger();
        const headings: Array<{ depth: number; text: string; slug: string }> = [];
        function walk(node: Root | Content): void {
          if (!node || typeof node !== "object") return;
          if (node.type === "heading") {
            const h = node as Heading;
            if (h.depth >= 1 && h.depth <= 6) {
              const text = toString(h) || "";
              const slug = slugger.slug(text);
              headings.push({ depth: h.depth, text, slug });
            }
          }
          const maybeParent = node as unknown as Parent;
          const children = Array.isArray((maybeParent as Parent).children)
            ? ((maybeParent as Parent).children as unknown as Content[])
            : [];
          for (const c of children) walk(c);
        }
        walk(tree);
        if (!cancelled) setToc(headings);

        // Extend sanitizer to allow id on headings and safe link attrs
        const schema = JSON.parse(JSON.stringify(defaultSchema)) as unknown as typeof defaultSchema;
        for (const tag of ["h1","h2","h3","h4","h5","h6"]) {
          schema.attributes[tag] = [...(schema.attributes[tag] || []), "id"];
        }
        schema.attributes["a"] = [
          ...(schema.attributes["a"] || []),
          "href",
          "name",
          "target",
          "rel"
        ];

        const file = await unified()
          .use(remarkParse)
          .use(remarkSlug)
          .use(remarkRehype)
          .use(rehypeSanitize, schema)
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

  const onTocClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "a") {
      const href = (target as HTMLAnchorElement).getAttribute("href") || "";
      if (href.startsWith("#")) {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", href);
        }
      }
    }
  };

  return (
    <div className="markdown-container">
      {toc.length > 0 && (
        <nav className="markdown-toc" aria-label="Mapa da Leitura" onClick={onTocClick}>
          <strong>Mapa da Leitura</strong>
          <ul>
            {toc
              .filter((h) => h.depth <= 4)
              .map((h, i) => (
                <li key={i} style={{ marginLeft: (h.depth - 1) * 12 }}>
                  <a href={`#${h.slug}`}>{h.text}</a>
                </li>
              ))}
          </ul>
        </nav>
      )}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
