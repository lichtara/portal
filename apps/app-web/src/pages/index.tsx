import { ConstelacaoManifesto } from "../modules/syntria/ConstelacaoManifesto";

export default function HomePage() {
  return (
    <main>
      <h1>Constelação Viva</h1>
      <ConstelacaoManifesto />
      <nav>
        <ul>
          <li><a href="/mandalas">/mandalas</a></li>
          <li><a href="/mandalas?id=mandala-agents">/mandalas?id=mandala-agents</a></li>
          <li><a href="/mandalas?id=mandala-agents-condensado">/mandalas?id=mandala-agents-condensado</a></li>
          <li><a href="/mandalas?id=mandala-petalas">/mandalas?id=mandala-petalas</a></li>
          <li><a href="/mandalas?id=mandala-pesquisa">/mandalas?id=mandala-pesquisa</a></li>
          <li><a href="/ativar">/ativar</a></li>
          <li><a href="/painel">/painel</a></li>
          <li><a href="/boas-vindas">/boas-vindas</a></li>
          <li><a href="/sobre">/sobre</a></li>
        </ul>
      </nav>
    </main>
  );
}
