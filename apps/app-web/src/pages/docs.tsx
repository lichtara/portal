import { useEffect, useMemo, useState } from "react";
import "../styles/markdown.css";

type DocItem = { title: string; path: string };

export default function DocsPage() {
  const [agents, setAgents] = useState<DocItem[]>([]);
  const [mandalas, setMandalas] = useState<DocItem[]>([]);

  const globMap = useMemo(() => {
    try {
      type GlobMap = Record<string, (() => Promise<string>) | string>;
      const viteLike = import.meta as unknown as {
        glob?: (pattern: string, opts?: Record<string, unknown>) => GlobMap;
      };
      const mods: GlobMap = viteLike.glob?.("../../content/core/**/*.md", { as: "raw" }) || {};
      return mods as GlobMap;
    } catch {
      return {} as Record<string, (() => Promise<string>) | string>;
    }
  }, []);

  useEffect(() => {
    async function load() {
      const keys = Object.keys(globMap);
      const rel = (full: string) => full.replace(/^.*\/content\/core\//, "");
      const loadTitle = async (mod: (() => Promise<string>) | string) => {
        try {
          const content = typeof mod === "function" ? await mod() : mod;
          return extractTitle(String(content));
        } catch {
          return undefined;
        }
      };
      if (keys.length) {
        const a: DocItem[] = [];
        const m: DocItem[] = [];
        for (const p of keys) {
          const r = rel(p);
          // classify
          if (r.startsWith("agents/")) {
            const title = (await loadTitle(globMap[p])) || r.replace(/^agents\//, "");
            a.push({ title, path: r });
          } else if (/^mandala-.*\.md$/.test(r)) {
            const title = (await loadTitle(globMap[p])) || r.replace(/\.md$/, "");
            m.push({ title, path: r });
          }
        }
        a.sort((x, y) => x.title.localeCompare(y.title));
        m.sort((x, y) => x.title.localeCompare(y.title));
        setAgents(a);
        setMandalas(m);
        return;
      }
      // Fallback when glob is not available (serve from static)
      setMandalas([
        { title: "Mandala Agents", path: "mandala-agents.md" },
        { title: "Mandala Agents Condensado", path: "mandala-agents-condensado.md" },
        { title: "Mandala Pesquisa", path: "mandala-pesquisa.md" },
      ]);
    }
    load();
  }, [globMap]);

  return (
    <main className="markdown-body">
      <h1>Documentos do Portal</h1>
      <section>
        <h2>Manual dos Agents</h2>
        {agents.length === 0 && <p>Em breve…</p>}
        <ul>
          {agents.map((d) => (
            <li key={d.path}>
              <a href={`/mandalas?path=${encodeURIComponent(d.path)}`}>{d.title}</a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Pesquisa (Mandalas)</h2>
        {mandalas.length === 0 && <p>Em breve…</p>}
        <ul>
          {mandalas.map((d) => (
            <li key={d.path}>
              <a href={`/mandalas?path=${encodeURIComponent(d.path)}`}>{d.title}</a>
            </li>
          ))}
        </ul>
      </section>
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
