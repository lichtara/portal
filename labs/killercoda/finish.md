# Serviços no ar

- Serviço: `curl http://127.0.0.1:3000/health || curl http://127.0.0.1:3000/healthz`
- Proxy via Vite: `curl http://127.0.0.1:5173/api/syntaris/healthz`

Teste de protocolo:

```
curl -s -X POST http://127.0.0.1:3000/protocolo/alinhar-consciencia \
  -H 'Content-Type: application/json' \
  -d '{"dados_campo_informacional":[{"frequencia":430.2,"amplitude":0.8},{"frequencia":432.0,"amplitude":1.0},450.5,864.0],"intencao_operador_humano":{"frequencia_coerencia":432,"banda_relativa":0.05},"limiar_coerencia_minimo":0.6}'
```

Logs (em terminais separados):

```
# serviço
ps aux | rg syntaris | rg -v rg
# app
ps aux | rg vite | rg -v rg
```

Se algo cair, rode:

```
bash assets/start-services.sh
```

