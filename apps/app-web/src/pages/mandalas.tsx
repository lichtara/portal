import { useEffect, useState } from "react";
import { MarkdownView } from "../components/MarkdownView";

export default function MandalasPage() {
  const [md, setMd] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const got = params.get("id") || "";
    setId(got);
    if (!got) return;
    fetch(`/content/core/${got}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.statusText)))
      .then(setMd)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main>
      <h1>Mandalas</h1>
      {!id && (
        <p>Informe um id via query: <code>?id=mandala-agents</code>. Arquivos são buscados em <code>content/core/</code>.</p>
      )}
      {error && <p>Erro ao carregar: {error}</p>}
      {md ? <MarkdownView markdown={md} /> : null}
    </main>
  );
}
