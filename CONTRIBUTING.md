# Contribuindo — Portal Lichtara

Bem-vinda(o)! Este guia resume como iniciar e colaborar.

## Onboarding rápido
- Requisitos: Node 20+, npm 10+.
- Instale hooks locais: `git config core.hooksPath .githooks`
- Varredura local de segredos: `scripts/scan-secrets.sh`
- App UI: `cd apps/app-web && npm ci && npm run build` (placeholders por enquanto)

## Padrões
- Commits: convencional (ex.: `feat:`, `fix:`, `docs:`, `chore:`).
- Estrutura: UI em `apps/app-web/`; serviços em `services/`; docs em `docs/`.
- Licenças: ver `LICENSES.md` (v2.0 para artefatos de Campo; v1.0 para utilitários/SDKs/código técnico).

## Segurança
- Nunca commitar segredos reais. Use `.env.example`.
- CI executa Gitleaks e auditorias básicas.

## Issues e PRs
- Descreva contexto, motivação e escopo.
- Abra PRs pequenos e focados; inclua notas de verificação.

## DCO (Assinatura de commits)
Este repositório exige conformidade com o Developer Certificate of Origin (DCO). Veja `DCO` na raiz do projeto.

Ao criar commits, assine-os com `Signed-off-by:` usando:

```
git commit -s -m "feat: sua mensagem"
```

Para facilitar, habilite o hook local (já incluso no repo) que adiciona o sign-off automaticamente se faltar:

```
git config core.hooksPath .githooks
```

Se necessário, ajuste seu nome/e-mail de git:

```
git config user.name  "Seu Nome"
git config user.email "seu.email@exemplo.com"
```

PRs sem DCO válido falharão na checagem de CI.
