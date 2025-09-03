# Segurança — Portal Lichtara

Este documento resume práticas e ferramentas de segurança para desenvolvimento e operação.

## Proteção de segredos
- CI: varredura com Gitleaks (`.github/workflows/secret-scan.yml`).
- Local: `scripts/scan-secrets.sh` e hook `pre-commit` (`git config core.hooksPath .githooks`).
- `.gitignore` reforçado para `.env` e variantes; comite apenas `.env.example`.

## Rotação e incidentes
- Suspeita de vazamento: rotacione OpenAI, Stripe, Google, Notion, HF, GitHub PAT, NPM, Terraform, Sentry.
- Reescreva histórico (git filter-repo/filter-branch), force push e notifique a equipe para `git reset --hard`.

## Dependências e licenças
- Auditoria no CI: `npm audit` (apps/app-web) e relatório de licenças (`license-checker`).
- Preferir dependências com manutenção ativa e licenças compatíveis.

## Acesso e GitHub
- Times e permissões granulares; branch protection em `main` com status checks.
- Secret Scanning e Push Protection ativados (se disponível no plano).

## Observabilidade
- SYNTARIS como base de telemetria (latência, erros, tráfego, heartbeats).
- Use IDs de correlação e logs estruturados (JSON). 

## Backups
- Automatizar snapshots e restauração (ver `infra/backup/README.md`).

