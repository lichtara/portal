# App Web — SYNTRIA (UI/experiência)
Estrutura mínima para as primeiras páginas e módulos da UI.

## Páginas iniciais
- `/` — Visão da Constelação Viva
- `/mandalas` — Mandala Agents & Mandala das 5 Pétalas
- `/ativar` — Ritual do SIM + ativação de agents
- `/painel` — Insights (LUMORA), estratégia (FINCE), saúde (SYNTARIS)

## Módulos
`src/modules/syntria/` — componentes e fluxos de rituais/mandalas.

## Desenvolvimento
Scripts ainda são placeholders. Integração com framework (Next/Vite) pode ser adicionada depois.

## Estrutura de pastas
- `src/pages/` — páginas (`/`, `/mandalas`, `/ativar`, `/painel`)
- `src/modules/syntria/` — rituais/mandalas (ex.: `ActivateRitual.tsx`)
- `src/components/` — componentes compartilhados
- `src/styles/` — estilos
- `src/lib/` — utilitários

## Licenças
- Conteúdos vivos (rituais, mandalas, textos e experiências): Lichtara License v2.0
  - https://github.com/lichtara/license/blob/main/lichtara_licence_v2.0/lichtara_licence_v2.0.md
- Código técnico (componentes, módulos, utilitários, build tooling): Lichtara License v1.0 (quando desejado)
  - https://github.com/lichtara/license/blob/main/lichtara_licence_v1.0/LICHTARA-LICENSEv1.0.md
Veja também `portal/LICENSES.md` para o mapeamento por diretórios.
