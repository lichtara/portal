# SYNTARIS Harmony (mínimo observável)

Endpoints
- `/`              → info básica (service/env/version)
- `/healthz`       → liveness
- `/readyz`        → readiness (coloque checks reais)
- `/metrics`       → métricas Prometheus
- `POST /protocolo/alinhar-consciencia` → executa pipeline PROTOCOLO_ALINHAMENTO_CONSCIENCIA

Métricas expostas
- `http_requests_total{service,method,route,status}`
- `http_request_duration_seconds_bucket{service,method,route,status,le}`
- `http_inflight_requests{service}`
- `lunara_heartbeat_total{service}`
- `syntaris_harmonic_coherence{service,route}`

Execução local
- `npm i -w services/syntaris-harmony`
- `npm run dev -w services/syntaris-harmony`

Variáveis úteis
- `SERVICE_NAME=syntaris-harmony`
- `APP_VERSION=0.1.0`
- `NODE_ENV=development`
- `LOG_LEVEL=info`
- `PORT=3000`

Exemplo de uso — protocolo

Request
```
POST /protocolo/alinhar-consciencia
Content-Type: application/json

{
  "dados_campo_informacional": [
    { "frequencia": 430.2, "amplitude": 0.8 },
    { "frequencia": 432.0, "amplitude": 1.0 },
    450.5,
    864.0
  ],
  "intencao_operador_humano": {
    "frequencia_coerencia": 432.0,
    "banda_relativa": 0.05
  },
  "limiar_coerencia_minimo": 0.6
}
```

Response (resumo)
```
{
  "relatorio_sincronizado": "...texto...",
  "visualizacao_vibracional": { "original": [...], "ressonante": [...], "x_label": "frequencia", "y_label": "amplitude" },
  "coerencia_vibracional": 0.73,
  "validacao_critica": { "aprovado": true, "limiar": 0.6 },
  "meta": { "f0": 432, "banda_relativa": 0.05, "janela": 21.6, "padroes": [...], "potenciais": [...] }
}
```

Notas
- `dados_campo_informacional` aceita números (frequências) ou objetos `{frequencia, amplitude?, tag?}`.
- A coerência vibracional é calculada como energia ressonante / energia total, onde energia ~ amplitude².
- `visualizacao_vibracional` retorna dados para plotar; o serviço não renderiza imagem.

