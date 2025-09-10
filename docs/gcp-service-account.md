# GCP — Service Account, Secrets e Cloud Run

Este guia cria uma Service Account, aplica roles mínimas, configura o Secret Manager e orienta o deploy no Cloud Run.

## Pré‑requisitos
- Projeto GCP ativo (ID: `PROJECT_ID`)
- `gcloud` autenticado localmente OU GitHub Actions com `GCP_SA_KEY` (JSON)

## APIs necessárias
```bash
gcloud services enable run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

## Service Account
Crie uma SA para CI/CD (ex.: `lumora-deployer`):
```bash
gcloud iam service-accounts create lumora-deployer \
  --display-name "Lumora Deployer"
```

Anote o e-mail da SA (ex.: `lumora-deployer@PROJECT_ID.iam.gserviceaccount.com`).

## Roles mínimas
Atribua as permissões essenciais:
```bash
PROJECT_ID=SEU_PROJECT
SA=lumora-deployer@${PROJECT_ID}.iam.gserviceaccount.com

# Cloud Run Admin (deploy)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member serviceAccount:${SA} \
  --role roles/run.admin

# Service Account User (executar com SA padrão)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member serviceAccount:${SA} \
  --role roles/iam.serviceAccountUser

# Artifact/Container Registry (pull/push imagens)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member serviceAccount:${SA} \
  --role roles/artifactregistry.writer

# Secret Manager (acessar secrets)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member serviceAccount:${SA} \
  --role roles/secretmanager.secretAccessor
```

## Secret Manager
Crie o secret e injete a chave (local ou via CI):
```bash
# Criar secret (ignora erro se já existir)
gcloud secrets create OPENAI_API_KEY --replication-policy=automatic || true

# Adicionar versão com valor atual
echo -n "$OPENAI_API_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=-
```

No Cloud Run, referencie o secret com `--set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest`.

## Deploy no Cloud Run (manual)
```bash
PROJECT_ID=SEU_PROJECT
REGION=sa-east1
IMAGE=gcr.io/${PROJECT_ID}/lumora:latest

# Exemplo: build local e push (opcional)
# docker build -t ${IMAGE} . && docker push ${IMAGE}

gcloud run deploy lumora \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest \
  --set-env-vars LUMORA_MODEL=gpt-4o-mini,LUMORA_TEMPERATURE=0.2
```

## Dicas
- Use `min-instances=0` e `max-instances` apropriado para custos/previsibilidade.
- Proteja o secret: controle acesso via IAM e evite logar conteúdo sensível.
- Para ambientes múltiplos, use secrets por ambiente (ex.: `OPENAI_API_KEY_STG`, `OPENAI_API_KEY_PRD`).
