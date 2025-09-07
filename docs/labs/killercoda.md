# Killercoda — Lab Interativo do Portal

Este guia ajuda a executar o Portal (app + serviço) em um lab Killercoda.

## Requisitos
- Cenário ativo em: https://killercoda.com/lichtara
- Acesso ao terminal do lab

## Passos

1) Node 20 via nvm

```
if ! command -v nvm >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  . "$HOME/.nvm/nvm.sh"
fi
nvm install 20.19.4
nvm use 20.19.4
node -v && npm -v
```

2) Instalar dependências

```
# na raiz do repositório
npm ci -w services/syntaris-harmony
npm ci -w apps/app-web
```

3) Subir serviços (duas abas ou tmux)

```
# aba 1
npm run dev -w services/syntaris-harmony
# serviço em http://127.0.0.1:3000
```

```
# aba 2
npm run dev -w apps/app-web
# Vite em http://127.0.0.1:5173
```

4) Validar rapidamente

```
curl -s http://127.0.0.1:3000/health || curl -s http://127.0.0.1:3000/healthz
curl -s http://127.0.0.1:5173/api/syntaris/healthz
```

5) Protocolo (exemplo)

```
PAYLOAD='{"dados_campo_informacional":[{"frequencia":430.2,"amplitude":0.8},{"frequencia":432.0,"amplitude":1.0},450.5,864.0],"intencao_operador_humano":{"frequencia_coerencia":432,"banda_relativa":0.05},"limiar_coerencia_minimo":0.6}'
curl -s -X POST http://127.0.0.1:3000/protocolo/alinhar-consciencia \
  -H 'Content-Type: application/json' -d "$PAYLOAD" | head -c 400; echo
```

## Dicas
- Se o lab expõe portas publicamente, mapeie as portas 3000 (serviço) e 5173 (UI) conforme instruções do cenário.
- Use `npm run dev` (raiz) para subir ambos em um runner único (`scripts/dev.sh`).
- Para Sentry no lab, copie `apps/app-web/.env.example` para `.env` e informe `VITE_SENTRY_DSN` (não comitar).

