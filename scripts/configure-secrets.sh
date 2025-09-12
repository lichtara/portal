#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) não encontrado. Instale em https://cli.github.com/" >&2
  exit 1
fi

# Garante que estamos no repositório correto
if ! gh repo view >/dev/null 2>&1; then
  echo "Execute este script dentro do repositório GitHub (diretório raiz)." >&2
  exit 1
fi

echo "Configuração segura de segredos no GitHub (Actions). Valores NÃO ficarão no histórico do shell."

read -r -p "GCP_PROJECT_ID (ex.: meu-projeto): " GCP_PROJECT_ID
read -r -p "GCP_REGION [sa-east1]: " GCP_REGION
GCP_REGION=${GCP_REGION:-sa-east1}

echo -n "Caminho para o JSON da Service Account (GCP_SA_KEY): "
read -r GCP_SA_FILE
if [ ! -f "$GCP_SA_FILE" ]; then
  echo "Arquivo não encontrado: $GCP_SA_FILE" >&2
  exit 1
fi

read -s -p "OPENAI_API_KEY (produção, de Service Account preferencial): " OPENAI_API_KEY
echo

echo "Aplicando segredos com gh secret set (via stdin) ..."

printf %s "$GCP_PROJECT_ID" | gh secret set GCP_PROJECT_ID --app actions --body-file -
printf %s "$GCP_REGION"     | gh secret set GCP_REGION     --app actions --body-file -
printf %s "true"             | gh secret set GCP_SYNC_SECRETS --app actions --body-file -
cat "$GCP_SA_FILE"           | gh secret set GCP_SA_KEY     --app actions --body-file -
printf %s "$OPENAI_API_KEY"  | gh secret set OPENAI_API_KEY --app actions --body-file -

echo "Segredos configurados. Você pode acionar o release agora."

