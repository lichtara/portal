import "../styles/markdown.css";
import { Sentry } from "../sentry.client";

export default function PainelPage() {
  const isDev = import.meta.env.MODE !== "production";
  const debug = () => {
    Sentry.captureException(new Error("Debug Sentry: exemplo de captura"));
    alert("Evento enviado ao Sentry (captureException)");
  };
  const crash = () => {
    // Força erro para testar ErrorBoundary
    throw new Error("Debug Sentry: erro proposital");
  };
  return (
    <main className="markdown-body">
      <h1>Painel</h1>
      <ul>
        <li>Insights — LUMORA</li>
        <li>Estratégia — FINCE</li>
        <li>Saúde — SYNTARIS</li>
      </ul>
      {isDev && (
        <div style={{ marginTop: 16 }}>
          <button onClick={debug} style={{ marginRight: 8 }}>Debug Sentry (capturar)</button>
          <button onClick={crash}>Debug Sentry (crash)</button>
        </div>
      )}
    </main>
  );
}
