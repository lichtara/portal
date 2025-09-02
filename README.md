# Portal Lichtara — Plataforma Viva
Aplicações, serviços e agents operacionais da Constelação.

## Visão
- UI (SYNTRIA): `apps/app-web/`
- Serviços (FLUX, LUMORA, FINCE…): `services/`
- APIs e docs: `docs/`
- Infraestrutura: `infra/`
- CI: `.github/workflows/ci-portal.yml`

Licenças: ver repositório `license`. Artefatos de Campo (mandalas/rituais) — Lichtara License v2; utilidades/SDKs, se desejado, v1.

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
npm run build        # constrói `apps/app-web`
npm run lint         # placeholder
npm run test         # placeholder
```

## Integração com `/core`
Durante o build, podemos puxar `core/docs/mandala-*.md` para `apps/app-web/content/core/`.
Exemplo de passo (ajuste `<org>`):

```
- name: Pull core docs
  run: |
    git clone --depth=1 https://github.com/<org>/core tmp-core
    mkdir -p apps/app-web/content/core
    rsync -a tmp-core/docs/ apps/app-web/content/core/
```

## Sobre
Referencie as licenças no repositório `license` e apresente na tela "Sobre" da UI.

