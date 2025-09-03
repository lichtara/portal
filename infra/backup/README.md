# Backup e Recuperação

Diretrizes gerais:
- Backups regulares de bancos e storages (SOLARA) com retenção (ex.: 7/30/180 dias).
- Testes periódicos de restauração.
- Scripts versionados e parametrizados.

Exemplo (placeholder):
```
# Dump PostgreSQL
pg_dump --no-owner "$DATABASE_URL" > backups/db-$(date +%F).sql

# Snapshot de diretório
rsync -a --delete /var/app/data/ backups/data-$(date +%F)/
```

