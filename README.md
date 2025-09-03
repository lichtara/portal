# Portal Lichtara — Plataforma Viva
Aplicações, serviços e agents operacionais da Constelação.

## Visão
- UI (SYNTRIA): `apps/app-web/`
- Serviços (FLUX, LUMORA, FINCE…): `services/`
- APIs e docs: `docs/`
- Infraestrutura: `infra/`
- CI: `.github/workflows/ci-portal.yml`

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
npm run build        # constrói `apps/app-web`
npm run lint         # placeholder
npm run test         # placeholder
```

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
- Observabilidade (SYNTARIS): `docs/OBSERVABILIDADE.md`
- Backup e recuperação: `infra/backup/README.md`

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
