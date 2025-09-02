import { ConstelacaoManifesto } from "../modules/syntria/ConstelacaoManifesto";

export default function HomePage() {
  return (
    <main>
      <h1>Constelação Viva</h1>
      <ConstelacaoManifesto />
      <nav>
        <ul>
          <li><a href="/mandalas">/mandalas</a></li>
          <li><a href="/ativar">/ativar</a></li>
          <li><a href="/painel">/painel</a></li>
        </ul>
      </nav>
    </main>
  );
}
