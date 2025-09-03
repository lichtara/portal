import { useEffect, useMemo, useState } from "react";
import "../styles/markdown.css";

type DocItem = { id: string; title: string };

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);

  const globMap = useMemo(() => {
    try {
      const mods: Record<string, any> = (import.meta as any).glob?.("../../content/core/*.md", { as: "raw" }) || {};
      return mods;
    } catch {
      return {} as Record<string, any>;
    }
  }, []);

  useEffect(() => {
    async function load() {
      const entries: DocItem[] = [];
      const keys = Object.keys(globMap);
      if (keys.length) {
        for (const p of keys) {
          const id = p.match(/([^/]+)\.md$/)?.[1] || p;
          let raw = "";
          try {
            const mod = (globMap as any)[p];
            const content = typeof mod === "function" ? await mod() : mod;
            raw = String((content as any)?.default ?? content);
          } catch {}
          const title = extractTitle(raw) || id;
          entries.push({ id, title });
        }
        setDocs(entries.sort((a, b) => a.title.localeCompare(b.title)));
        return;
      }
      // Fallback: known docs and fetch to infer title
      const fallback = [
        "mandala-agents",
        "mandala-agents-condensado",
        "mandala-pesquisa",
        "mandala-petalas",
      ];
      const fetched: DocItem[] = [];
      for (const id of fallback) {
        try {
          const res = await fetch(`/content/core/${id}.md`);
          const raw = res.ok ? await res.text() : "";
          fetched.push({ id, title: extractTitle(raw) || id });
        } catch {
          fetched.push({ id, title: id });
        }
      }
      setDocs(fetched);
    }
    load();
  }, [globMap]);

  return (
    <main className="markdown-body">
      <h1>Documentos do Portal</h1>
      <p>Selecione um documento para visualizar:</p>
      <ul>
        {docs.map((d) => (
          <li key={d.id}>
            <a href={`/mandalas?id=${d.id}`}>{d.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

function extractTitle(md: string): string | undefined {
  // Try YAML frontmatter title
  const fm = md.match(/^---[\s\S]*?---/);
  if (fm) {
    const t = fm[0].match(/\btitle\s*:\s*"([^"]+)"/);
    if (t?.[1]) return t[1];
  }
  // First H1 heading
  const h1 = md.split(/\r?\n/).find((l) => /^#\s+/.test(l));
  if (h1) return h1.replace(/^#\s+/, "").trim();
  return undefined;
}

