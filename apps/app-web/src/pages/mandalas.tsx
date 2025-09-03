import { useEffect, useMemo, useState } from "react";

import { MarkdownView } from "../components/MarkdownView";

export default function MandalasPage() {
  const [md, setMd] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string>("");

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
      {md ? <MarkdownView markdown={md} /> : null}
    </main>
  );
}
