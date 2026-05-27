# Campanha Prédios e Vilas

Sistema web em Next.js para substituir a planilha de campanha de prédios e vilas.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Zod
- Server Actions
- Importação `.xlsx` com `xlsx`

## Instalação local

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Configure `DATABASE_URL` no arquivo `.env` com uma conexão PostgreSQL válida.

## Importação da planilha

A planilha deve ter uma aba chamada `Campanha`.

- Linha 1: pode conter título
- Linha 2: cabeçalhos
- Linha 3 em diante: dados

Mapeamento esperado:

| Coluna | Campo |
| --- | --- |
| A | id |
| B | nome |
| C | endereco |
| D | tipo |
| E | numero |
| F | quantidadeResidencias |
| G | modalidade |
| H | tipoRecepcao |
| I | responsavel |
| J | dataDesignacao |
| K | quadra |
| L | observacoes |

Se o ID já existir, o registro é atualizado. Se não existir, é criado. Registros sem responsável ficam como `PENDENTE`; registros com responsável ficam como `DESIGNADO`.

## Rotas

- `/` Dashboard
- `/predios` Lista geral
- `/predios/novo` Novo prédio/vila
- `/predios/[id]` Detalhes
- `/predios/[id]/editar` Editar
- `/designacoes` Controle de designações
- `/importar` Importar planilha
- `/relatorios` Relatórios e exportações
- `/configuracoes` Dados básicos do sistema

## Deploy na Vercel

1. Crie um banco PostgreSQL no Neon, Supabase, Railway ou outro provedor.
2. Crie um projeto na Vercel conectado ao repositório GitHub.
3. Adicione `DATABASE_URL` em Project Settings > Environment Variables.
4. Rode as migrations no ambiente de deploy com:

```bash
npx prisma migrate deploy
```

O script de build já executa `prisma generate` antes do `next build`.
