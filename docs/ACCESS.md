# Gestão de Acesso

## GitHub
- Times por domínio (UI, Serviços, Infra, Docs) com permissões mínimas necessárias.
- Branch protection para `main`: status checks obrigatórios, reviews, restrição de force-push.
- Secret Scanning e Push Protection habilitados.

## Segredos
- Armazenar em cofre (ex.: GitHub Secrets, 1Password). Nunca em repositório.
- Fluxos de rotação definidos por serviço (códigos de emergência documentados).

