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
- Rodar somente a UI: `npm run dev -w apps/app-web`
- Proxy para o serviço `syntaris-harmony` via Vite:
  - Em dev, chamadas a `/api/syntaris` são redirecionadas para `http://localhost:3000` (config em `vite.config.ts`).
  - Para apontar para outra URL em dev, defina `VITE_SYNTARIS_DEV_TARGET` ao iniciar o Vite.
  - Em produção, defina `VITE_SYNTARIS_BASE_URL` no `.env`.
  
Para subir app + serviço juntos a partir da raiz do repositório: `npm run dev`.

## Estrutura de pastas
- `src/pages/` — páginas (`/`, `/mandalas`, `/ativar`, `/painel`)

### Integração com Syntaris — Protocolo

- Página `/protocolo` envia requisições ao serviço `syntaris-harmony` para executar o pipeline de alinhamento de consciência.
- Em desenvolvimento, as chamadas usam proxy Vite via path `/api/syntaris` para o alvo `http://localhost:3000` (config em `vite.config.ts`).
- Em produção, defina `VITE_SYNTARIS_BASE_URL` apontando para a URL pública do serviço (ex.: `https://api.seudominio/syntaris`).
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
