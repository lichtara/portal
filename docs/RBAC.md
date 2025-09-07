# RBAC – GitHub e Grafana (Least-Privilege)

## GitHub

- Times: `admins`, `maintainers`, `devs`, `viewers`.
- Acesso por time (evitar usuários individuais).
- Permissões por repo:
  - admins: Admin
  - maintainers: Maintain (ou Write + branch rules)
  - devs: Write
  - viewers: Read
- Proteção de branch `main`:
  - Require PR review (>=1; ideal 2)
  - Require status checks (CI, tests, gitleaks, build)
  - Dismiss stale approvals
  - Restrict who can push (apenas admins/maintainers)
  - Require linear history (opcional)
  - Require signed commits (opcional)
- Actions (mínimo necessário):
  - Definir `permissions:` explícitas nos workflows
  - Rodar apenas em `pull_request`/`push` relevantes
  - Usar `environments` com approvers para deploys
- Secrets e Vars:
  - Somente em Org/Repo/Environment secrets
  - Prefixos claros (`SENTRY_`, `GRAFANA_`, `VITE_`, etc.)
  - Rotação semestral
- Environments:
  - Criar `dev`, `staging`, `prod` com required reviewers
  - Segregar secrets por ambiente

### Exemplos práticos (GH CLI)

> Substitua `ORG/REPO` conforme o seu repositório e execute com um token adequado.

```bash
# Branch protection (básico)
gh api \
  -X PUT repos/ORG/REPO/branches/main/protection \
  -F required_pull_request_reviews.required_approving_review_count=1 \
  -F required_status_checks.strict=true \
  -F required_status_checks.contexts[]='CI Portal' \
  -F enforce_admins=true \
  -F restrictions=null

# Criar ambientes (manual via UI recomendado)
# Depois associe o workflow de deploy com `environment: dev|staging|prod`.
```

## Grafana

- Times: `Grafana-admins`, `Grafana-editors`, `Grafana-viewers`.
- Pastas por domínio (ex.: `Observabilidade/API`, `Infra/Prod`).
- Permissões por pasta:
  - Admins: Admin
  - Editors: Edit
  - Viewers: View
- Datasources:
  - Credenciais via secrets/variáveis (nunca texto claro)
  - Escopo mínimo (read-only)
- Alerts:
  - Agrupar por pasta/time responsável
  - Contact points seguros (secretos)
  - Rotas por severidade (crit/major/minor)
- Acesso & Autenticação:
  - SSO/2FA recomendado, revogar inativos
  - Desabilitar anônimo
- Boas práticas:
  - Evitar var `*All*` em dashboards produtivos
  - Explore só para Editors/Admins
  - Expor `/metrics` apenas internamente ou com proteção

