# Guia de Contribuição

Obrigado por contribuir com o Campanha Prédios e Vilas.

## Antes de começar

- Verifique se sua mudança está relacionada ao objetivo do sistema.
- Evite refatorações amplas junto com mudanças funcionais.
- Preserve o histórico de designações.
- Não inclua dados reais sensíveis em commits.

## Ambiente local

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Padrão de branch

Use nomes curtos e claros:

```text
feature/relatorio-campanha
fix/bloqueio-semestral
docs/readme-profissional
```

## Checklist antes do pull request

- [ ] A mudança está focada.
- [ ] `npm run lint` passa.
- [ ] `npm run build` passa.
- [ ] Migrations foram criadas quando necessário.
- [ ] README ou documentação foram atualizados quando necessário.
- [ ] Não há credenciais ou dados sensíveis no commit.

## Convenção de commits

Prefira mensagens objetivas:

```text
Add semester blocking report
Fix contextual designation form
Update import validation
```

## Pull requests

Inclua:

- resumo da mudança;
- telas ou rotas afetadas;
- como testar;
- riscos conhecidos;
- prints quando a mudança for visual.
