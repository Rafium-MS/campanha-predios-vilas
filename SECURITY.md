# Política de Segurança

## Dados sensíveis

Não inclua no repositório:

- arquivos `.env`;
- strings de conexão;
- senhas;
- tokens;
- dumps de banco;
- planilhas com dados pessoais sensíveis;
- credenciais de Vercel, Neon, GitHub ou outros serviços.

## Reporte de vulnerabilidades

Para reportar uma vulnerabilidade:

1. Não abra uma issue pública com detalhes exploráveis.
2. Entre em contato diretamente com o mantenedor do projeto.
3. Inclua passos de reprodução, impacto e sugestão de correção quando possível.

## Boas práticas

- Use variáveis de ambiente para credenciais.
- Revise alterações em Prisma migrations antes de aplicar em produção.
- Execute `npm audit` periodicamente.
- Mantenha dependências atualizadas com cautela.
- Valide uploads de planilhas antes de processar os dados.

## Ambientes

Use bancos separados para desenvolvimento, preview e produção sempre que possível.

Nunca rode testes destrutivos contra o banco de produção.
