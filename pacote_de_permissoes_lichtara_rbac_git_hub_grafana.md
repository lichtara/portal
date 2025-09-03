# Pacote de Permissões — Lichtara (RBAC + GitHub + Grafana)

Abaixo estão os três artefatos para colar no repositório:

---

## 1) `k8s/rbac/ci-deployer-rbac.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: lichtara
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-deployer
  namespace: lichtara
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ci-deployer-role
  namespace: lichtara
rules:
  - apiGroups: [""]
    resources: ["configmaps","secrets","services"]
    verbs: ["get","list","watch","create","update","patch","delete"]
  - apiGroups: ["apps"]
    resources: ["deployments","statefulsets","daemonsets"]
    verbs: ["get","list","watch","create","update","patch","delete"]
  - apiGroups: ["monitoring.coreos.com"]
    resources: ["servicemonitors","podmonitors","prometheusrules"]
    verbs: ["get","list","watch","create","update","patch","delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-deployer-binding
  namespace: lichtara
subjects:
  - kind: ServiceAccount
    name: ci-deployer
    namespace: lichtara
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ci-deployer-role
```

**Notas**
- Se já existir a namespace, remova o primeiro bloco (`Namespace`).
- Para multi-ambiente, replique em `lichtara-dev`, `lichtara-prod`, etc.

---

## 2) `docs/permissions.md`

```md
# Permissions — GitHub, GHCR, Kubernetes e Grafana Cloud

## GitHub Actions (princípios)
- Use o `GITHUB_TOKEN` nativo com **menor privilégio**:

```yaml
permissions:
  contents: read
  id-token: write
```

- Só workflows de **build** precisam de acesso ao GHCR (write). O de **deploy** não.

## Secrets canônicos
- `KUBE_CONFIG` — kubeconfig (base64) do cluster/namespace de deploy.
- `GRAFANA_CLOUD_OTLP_ENDPOINT` — endpoint OTLP (traces/logs/metrics).
- `GRAFANA_CLOUD_API_TOKEN` — token *write-only* (ingest) para Grafana Cloud.
- `GHCR_USERNAME` / `GHCR_TOKEN` — apenas no pipeline de build (write:packages).
- `GHCR_READ_TOKEN` — se for criar `imagePullSecret` no cluster (read:packages).

## Tokens pessoais (quando inevitáveis)
- Prefira **Fine-grained PAT** restrito ao repo (`lichtara/portal`) com `Contents: Read & write` (só se fizer push local) e `Packages: write` (se publicar no GHCR localmente). Expiração curta.

## Kubernetes RBAC
- ServiceAccount `ci-deployer` com Role mínima por namespace (Deploy/Service/CM/Secret + CRDs de monitoring). Sem acesso cluster-wide.

## Grafana Cloud (política de acesso)
- Token de ingestão com escopos **apenas de escrita** por recurso que você usa:
  - `traces:write`
  - `metrics:write`
  - `logs:write`
- Não conceda leitura/admin através deste token.

## Segregação por função (recomendado)
- **Build**: GHCR write; sem kube.
- **Deploy**: kube + Grafana write; sem GHCR write.
- **Observabilidade**: tokens separados por ambiente (`dev`/`prod`).

## Rotação
- Rotacione secrets/tokens a cada 90 dias (ou menos). Monitore a validade.
```

---

## 3) `docs/grafana-cloud-policy.md`

```md
# Grafana Cloud — Política de Ingestão (Template)

**Descrição:** Token exclusivo para ingestão de telemetria do serviço `syntaris-harmony`.

## Escopos
- `traces:write`
- `metrics:write` (se enviar métricas)
- `logs:write` (se enviar logs)

> Não conceder: leitura, admin, dashboards, alerting, org-level.

## Limites / Boas práticas
- Um token por **ambiente** (dev/prod).
- Um token por **serviço** (opcional) para auditoria fina.
- Rotação: 90 dias.

## Variáveis esperadas no cluster
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS` = `Authorization=Bearer <TOKEN>`
- `OTEL_SERVICE_NAME` = `syntaris-harmony`
- `OTEL_RESOURCE_ATTRIBUTES` = `deployment.environment=<env>`

## Procedimento
1. Criar/rotacionar token na conta do Grafana Cloud com os escopos acima.
2. Atualizar o Secret `otel-auth` via pipeline de deploy (kubectl apply).
3. Validar ingestão (traces/metrics/logs) pelo stack correspondente.
```

