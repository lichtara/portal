import { useEffect, useMemo, useState } from "react";

import { MarkdownView } from "../components/MarkdownView";

export default function MandalasPage() {
  const [md, setMd] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [path, setPath] = useState<string>("");

  // Try to discover available mandalas via import.meta.glob (Vite-like bundlers)
  const available = useMemo(() => {
    try {
      type GlobMap = Record<string, (() => Promise<string>) | string>;
      const viteLike = import.meta as unknown as {
        glob?: (pattern: string, opts?: Record<string, unknown>) => GlobMap;
      };
      const mods: GlobMap = viteLike.glob?.("../../content/core/*.md", { as: "raw" }) || {};
      const ids = Object.keys(mods)
        .map((p) => p.match(/([^/]+)\.md$/)?.[1])
        .filter(Boolean) as string[];
      // Fallback to known examples if none found
      return ids.length ? ids : [
        "mandala-agents",
        "mandala-agents-condensado",
        "mandala-petalas",
        "mandala-pesquisa"
      ];
    } catch {
      return [
        "mandala-agents",
        "mandala-agents-condensado",
        "mandala-petalas",
        "mandala-pesquisa"
      ];
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gotId = params.get("id") || "";
    const gotPath = params.get("path") || "";
    const got = gotPath || gotId;
    setId(got);
    setPath(gotPath);
    if (!got) return;

    const tryFetch = () => {
      const url = gotPath ? `/content/core/${got}` : `/content/core/${got}.md`;
      return fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(r.statusText)));
    };

    const tryImport = async () => {
      try {
        type GlobMap = Record<string, (() => Promise<string>) | string>;
        const viteLike = import.meta as unknown as {
          glob?: (pattern: string, opts?: Record<string, unknown>) => GlobMap;
        };
        const mods: GlobMap = viteLike.glob?.("../../content/core/**/*.md", { as: "raw" }) || {};
        const key = gotPath
          ? Object.keys(mods).find((p) => p.endsWith(`/${gotPath}`))
          : Object.keys(mods).find((p) => p.endsWith(`/${got}.md`));
        if (key) {
          const mod = mods[key];
          const content = typeof mod === "function" ? await mod() : mod;
          return String(content);
        }
        throw new Error("not-found");
      } catch (e) {
        throw e;
      }
    };

    tryFetch()
      .then(setMd)
      .catch(() => tryImport().then(setMd).catch((e) => setError(String(e))));
  }, []);

  // Extract title from markdown frontmatter or first H1
  function extractTitle(mdText: string): string | undefined {
    const fm = mdText.match(/^---[\s\S]*?---/);
    if (fm) {
      const t = fm[0].match(/\btitle\s*:\s*"([^"]+)"/);
      if (t?.[1]) return t[1];
    }
    const h1 = mdText.split(/\r?\n/).find((l) => /^#\s+/.test(l));
    if (h1) return h1.replace(/^#\s+/, "").trim();
    return undefined;
  }

  function stripFrontmatter(mdText: string): string {
    return mdText.replace(/^---[\s\S]*?---\s*/, "");
  }

  const pageTitle = useMemo(() => (md ? extractTitle(md) : undefined), [md]);
  const displayMd = useMemo(() => (md ? stripFrontmatter(md) : md), [md]);

  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} — Portal Lichtara`;
    } else {
      document.title = `Mandalas — Portal Lichtara`;
    }
  }, [pageTitle]);

  const crumbs = useMemo(() => {
    if (!path) return [] as string[];
    const nice = (s: string) => {
      const map: Record<string, string> = {
        agents: "Agents",
        nucleo: "Núcleo",
        navegadores: "Navegadores",
        harmonizadores: "Harmonizadores",
        guardioes: "Guardiões",
        ativadores: "Ativadores",
      };
      return map[s] || s.replace(/\.[^.]+$/, "").replace(/(^|[-_/])([a-z])/g, (_, p1, p2) => (p1 ? " " : "") + p2.toUpperCase());
    };
    return path.split("/").map(nice);
  }, [path]);

  return (
    <main>
      <h1>Mandalas</h1>
      {!id && (
        <>
          <p>
            Informe um id via query, por exemplo: <code>?id=mandala-agents</code>. Arquivos são buscados em
            <code> content/core/</code>.
          </p>
          <h2>Disponíveis</h2>
          <ul>
            {available.map((k) => (
              <li key={k}>
                <a href={`/mandalas?id=${k}`}>{k}</a>
              </li>
            ))}
          </ul>
        </>
      )}
      {error && <p>Erro ao carregar: {error}</p>}
      {pageTitle && (
        <header>
          <h2>{pageTitle}</h2>
          {crumbs.length > 0 && (
            <p style={{ color: "#666", marginTop: -8 }}>{crumbs.join(" / ")}</p>
          )}
        </header>
      )}
      {md ? <MarkdownView markdown={displayMd} /> : null}
    </main>
  );
}
