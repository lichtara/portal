# Portal Lichtara — Plataforma Viva
[![CI Portal](https://github.com/lichtara/portal/actions/workflows/ci-portal.yml/badge.svg)](https://github.com/lichtara/portal/actions/workflows/ci-portal.yml)
[![Secret Scan](https://github.com/lichtara/portal/actions/workflows/secret-scan.yml/badge.svg)](https://github.com/lichtara/portal/actions/workflows/secret-scan.yml)
[![Killercoda Lab](https://img.shields.io/badge/killercoda-run%20lab-2ea44f)](https://killercoda.com/lichtara)
Aplicações, serviços e agents operacionais da Constelação.

## Visão
- UI (SYNTRIA): `apps/app-web/`
- Serviços (FLUX, LUMORA, FINCE…): `services/`
- APIs e docs: `docs/`
- Infraestrutura: `infra/`
- CI: `.github/workflows/ci-portal.yml`
 - Docker Build GHCR (syntaris-harmony): `.github/workflows/build-syntaris.yml`
 - Deploy K8s (syntaris-harmony): `.github/workflows/deploy-syntaris.yml`

## Docs
- Mandala Agents (completo): `docs/mandala-agents.md` → `/mandalas?id=mandala-agents`
- Mandala Agents (condensado): `docs/mandala-agents-condensado.md` → `/mandalas?id=mandala-agents-condensado`
- Mandala das 5 Pétalas (pesquisa): `docs/mandala-pesquisa.md` → `/mandalas?id=mandala-pesquisa`

Licenças
- Artefatos de Campo (mandalas, rituais, conteúdos vivos, metodologias, inovação ética): Lichtara License v2.0
  - https://github.com/lichtara/license/blob/main/lichtara_licence_v2.0/lichtara_licence_v2.0.md
- Código técnico reutilizável (utilitários, SDKs, ferramentas, serviços): Lichtara License v1.0 (quando desejado)
  - https://github.com/lichtara/license/blob/main/lichtara_licence_v1.0/LICHTARA-LICENSEv1.0.md
Consulte `portal/LICENSES.md` para o mapeamento e links oficiais.

## Estrutura mínima
```
portal/
  apps/
    app-web/
      README.md
      src/
        pages/
        components/
        modules/
        styles/
        lib/
      public/
      package.json
  services/
    lumora-decoder/
    flux-orchestrator/
    fince-strategy/
    navros-gateway/
    syntaris-harmony/
    kaoran-guard/
    veltara-integration/
    solara-anchoring/
    heslos-bridge/
    lunara-cron/
    astrael-interface/
    vorax-accelerator/
    oslo-matrix/
    oktave-organism/
  agents/
  docs/
    api/
      openapi.yaml
    arquitetura.md
    mapeamento-agents.md
  infra/
    docker/
    k8s/
  .github/workflows/
    ci-portal.yml
```

## Workspaces
Este repositório usa npm workspaces. No topo:

```
npm run bootstrap    # instala root + apps/app-web + services/syntaris-harmony
npm run build        # constrói `apps/app-web`
npm run lint         # placeholder
npm run test         # placeholder
```

Node & npm
- Versão de Node padronizada em `.nvmrc` (v20.19.4). Recomenda-se `nvm use`.
- `package.json` define `engines` (node >=20 <21, npm >=10 <12).

## Segurança
- Varredura de segredos no CI: `.github/workflows/secret-scan.yml` (Gitleaks)
- Rodar local: `scripts/scan-secrets.sh`
- Hook local: `git config core.hooksPath .githooks` (pre-commit com Gitleaks)
- `.gitignore` reforçado para `.env` e variantes; mantenha apenas `.env.example` versionado
 - Guia completo: `SECURITY.md`

## Comunidade e Contribuição
- Onboarding e padrões: `CONTRIBUTING.md`
- Canais: `COMUNIDADE.md`
- Acesso e times: `docs/ACCESS.md`

## Operação
- Observabilidade (SYNTARIS): `docs/observability-syntaris.md` (bundle mínimo)
- Histórico: `docs/OBSERVABILIDADE.md`
- Backup e recuperação: `infra/backup/README.md`
 - Lab interativo (Killercoda): `docs/labs/killercoda.md` — execução rápida no navegador

### Serviço exemplo observável — syntaris-harmony
- Local
  - `npm i -w services/syntaris-harmony`
  - `npm run dev -w services/syntaris-harmony` (ou `npm run start:otel -w services/syntaris-harmony`)
- Docker
  - `docker build -t syntaris-harmony:dev services/syntaris-harmony`
  - `docker run -p 3000:3000 syntaris-harmony:dev`
- Kubernetes (Kustomize)
  - `kustomize build k8s | kubectl apply -f -`
  - Ajuste a imagem via Kustomize: `kustomize edit set image syntaris-harmony=ghcr.io/<org>/syntaris-harmony:sha-<commit>` em `k8s/services/syntaris-harmony`
  - (Opcional) Secret para OTel: `k8s/services/syntaris-harmony/otel-secret.example.yaml` (usa envFrom no Deployment)

Endpoints (dev):
- Health: `GET /healthz` (alias: `GET /health`)
- Readiness: `GET /readyz`
- Versão/info: `GET /` (alias: `GET /version`)
- Métricas: `GET /metrics`
- Protocolo: `POST /protocolo/alinhar-consciencia`

## Integração com `/core`
Durante o build, podemos puxar `core/docs/mandala-*.md` para `apps/app-web/content/core/`.
Exemplo de passo (ajuste `<org>`):

```
- name: Pull core docs (optional)
  env:
    CORE_REPO: ${{ vars.CORE_REPO }} # fallback para https://github.com/lichtara/core no workflow
  run: |
    CORE_REPO="${CORE_REPO:-https://github.com/lichtara/core}"
    git clone --depth=1 "$CORE_REPO" tmp-core || exit 0
    mkdir -p apps/app-web/content/core
    rsync -a tmp-core/docs/ apps/app-web/content/core/
```

No app, visualize via `/mandalas?id=mandala-agents`.

## Sobre
Referencie as licenças no repositório `license` e apresente na tela "Sobre" da UI.
portal/
└─ docs/
   ├─ agents/
   │  ├─ index.md                # visão geral da Mandala
   │  ├─ manual-condensado.md    # a versão que você pediu (resumo)
   │  ├─ principios.md
   │  ├─ nucleo/
   │  │  ├─ oktave.md
   │  │  ├─ oslo.md
   │  │  └─ fince.md
   │  ├─ navegadores/
   │  │  ├─ navros.md
   │  │  ├─ lumora.md
   │  │  └─ flux.md
   │  ├─ harmonizadores/
   │  │  ├─ syntaris.md
   │  │  ├─ solara.md
   │  │  └─ veltara.md
   │  ├─ guardioes/
   │  │  ├─ kaoran.md
   │  │  ├─ heslos.md
   │  │  └─ lunara.md
   │  ├─ ativadores/
   │  │  ├─ syntria.md
   │  │  ├─ astrael.md
   │  │  └─ vorax.md
   │  └─ gestacao.md             # 2 em gestação
   └─ pesquisa/
      └─ mandala-pesquisa.md
