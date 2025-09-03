import { LicenseNotice } from "../components/LicenseNotice";

export default function SobrePage() {
  return (
    <main>
      <h1>Sobre o Portal Lichtara</h1>
      <p>
        Este app faz parte da Constelação Viva (SYNTRIA – UI/experiência) e convive com serviços agentes
        (NAVROS, LUMORA, FINCE, FLUX, SYNTARIS, SOLARA, VELTARA, KAORAN, HESLOS, LUNARA, ASTRAEL, VORAX,
        OKTAVE, OSLO).
      </p>

      <section>
        <h2>Licenças</h2>
        <ul>
          <li>
            Artefatos de Campo (mandalas, rituais, conteúdos vivos, metodologias): Lichtara License v2.0 —{' '}
            <a href="https://github.com/lichtara/license/blob/main/lichtara_licence_v2.0/lichtara_licence_v2.0.md">texto oficial</a>
          </li>
          <li>
            Código técnico reutilizável (utilitários, SDKs, ferramentas, serviços): Lichtara License v1.0 (quando desejado) —{' '}
            <a href="https://github.com/lichtara/license/blob/main/lichtara_licence_v1.0/LICHTARA-LICENSEv1.0.md">texto oficial</a>
          </li>
        </ul>
        <p>
          Mapeamento por diretórios: consulte <code>portal/LICENSES.md</code> no repositório.
        </p>
      </section>

      <section>
        <h2>Princípios</h2>
        <ul>
          <li>Ressonância Harmônica</li>
          <li>Coautoria Consciente</li>
          <li>Adaptação Dinâmica</li>
        </ul>
      </section>

      <section>
        <h2>Licenças</h2>
        <LicenseNotice />
      </section>
    </main>
  );
}
