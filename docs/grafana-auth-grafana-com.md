# Grafana.com OAuth em Grafana self-hosted (seguro e com least-privilege)

Esta configuração habilita login via Grafana.com em uma instância Grafana self-hosted. Para Grafana Cloud, o SSO Grafana.com já é nativo — não é necessário criar client manual.

Importante: nunca versione Client Secret. Armazene em Secret do GitHub/Kubernetes e rotacione imediatamente se o valor tiver sido exposto.

## Pré‑requisitos
- Client criado em grafana.com (OAuth Clients), com:
  - Allowed organizations: seu org (ex.: `lutzdebora`)
  - Scopes mínimos: `user:email`
  - Redirect URL: `<GRAFANA_URL>/login/grafana_com`

## Opção A — Arquivo de configuração (grafana.ini)

Em `custom.ini`/`grafana.ini`:

```
[auth.grafana_com]
enabled = true
allow_sign_up = true
client_id = <client-id>
client_secret = <client-secret>
scopes = user:email
allowed_organizations = lutzdebora
```

## Opção B — Variáveis de ambiente (recomendado)

```
GF_AUTH_GRAFANA_COM_ENABLED=true
GF_AUTH_GRAFANA_COM_ALLOW_SIGN_UP=true
GF_AUTH_GRAFANA_COM_CLIENT_ID=<client-id>
GF_AUTH_GRAFANA_COM_CLIENT_SECRET=<client-secret>
GF_AUTH_GRAFANA_COM_SCOPES=user:email
GF_AUTH_GRAFANA_COM_ALLOWED_ORGANIZATIONS=lutzdebora
# Se atrás de proxy / domínio
GF_SERVER_ROOT_URL=https://grafana.seudominio
```

## Kubernetes (Helm oficial grafana/grafana)

1) Crie o Secret com ID/Secret do client:

```
kubectl -n <ns> create secret generic grafana-oauth \
  --from-literal=GF_AUTH_GRAFANA_COM_CLIENT_ID="<client-id>" \
  --from-literal=GF_AUTH_GRAFANA_COM_CLIENT_SECRET="<client-secret>"
```

2) Values do Helm (exemplo):

```
# values.yaml
envFromSecret: grafana-oauth
env:
  - name: GF_AUTH_GRAFANA_COM_ENABLED
    value: "true"
  - name: GF_AUTH_GRAFANA_COM_ALLOW_SIGN_UP
    value: "true"
  - name: GF_AUTH_GRAFANA_COM_SCOPES
    value: user:email
  - name: GF_AUTH_GRAFANA_COM_ALLOWED_ORGANIZATIONS
    value: lutzdebora
  - name: GF_SERVER_ROOT_URL
    value: https://grafana.seudominio
# Alternativamente, em grafana.ini
grafana.ini:
  auth.grafana_com:
    enabled: true
    allow_sign_up: true
    scopes: user:email
    allowed_organizations: lutzdebora
```

Aplicar:

```
helm upgrade --install grafana grafana/grafana -n <ns> -f values.yaml
```

## GitHub Actions (opcional)

Use Environment Secrets por ambiente (dev/staging/prod) e crie/atualize o Secret do K8s no deploy:

```
kubectl -n "$NAMESPACE" create secret generic grafana-oauth \
  --from-literal=GF_AUTH_GRAFANA_COM_CLIENT_ID="${{ secrets.GRAFANA_OAUTH_CLIENT_ID }}" \
  --from-literal=GF_AUTH_GRAFANA_COM_CLIENT_SECRET="${{ secrets.GRAFANA_OAUTH_CLIENT_SECRET }}" \
  --dry-run=client -o yaml | kubectl -n "$NAMESPACE" apply -f -
```

## Segurança e boas práticas
- Rotacione imediatamente qualquer secret exposta publicamente.
- Scopes mínimos (`user:email`) e `allowed_organizations` definidos.
- Considere `GF_AUTH_DISABLE_LOGIN_FORM=true` para forçar SSO (opcional).
- Habilite 2FA/SSO para admins, e revisões periódicas de usuários.

## Testes e troubleshooting
- Verifique o botão “Sign in with Grafana.com” na tela de login.
- Erro de callback: confira Redirect URL do client e `GF_SERVER_ROOT_URL`.
- Atrás de proxy: preserve headers `X-Forwarded-Proto/Host` e ajuste `GF_SERVER_ROOT_URL`.

