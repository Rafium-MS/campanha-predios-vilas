# Território de Prédios e Vilas

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

Sistema web para controle de territórios de prédios e vilas, designações, campanhas, trabalho semestral, importação de planilhas e relatórios operacionais.

## Sumário

- [Objetivo](#objetivo)
- [Funcionalidades](#funcionalidades)
- [Modos de trabalho](#modos-de-trabalho)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação local](#instalação-local)
- [Banco de dados](#banco-de-dados)
- [Importação de planilha](#importação-de-planilha)
- [Rotas principais](#rotas-principais)
- [Deploy](#deploy)
- [Scripts](#scripts)
- [Qualidade e validação](#qualidade-e-validação)
- [Contribuição](#contribuição)
- [Código de conduta](#código-de-conduta)
- [Segurança](#segurança)
- [Licença](#licença)

## Objetivo

O projeto substitui uma planilha operacional usada para acompanhar prédios e vilas por um sistema web simples, responsivo e orientado a histórico.

Ele permite que usuários não técnicos:

- cadastrem e consultem prédios/vilas;
- importem dados de uma planilha `.xlsx`;
- organizem períodos de campanha e trabalho semestral;
- criem designações por responsável;
- registrem conclusões, cartas deixadas, observações e problemas;
- acompanhem progresso por dashboard e relatórios.

## Funcionalidades

- Dashboard com indicadores gerais e operacionais.
- Cadastro, edição, detalhes e exclusão de prédios/vilas.
- Busca por nome, endereço, quadra, responsável, status e tipo de recepção.
- Importação `.xlsx` com criação ou atualização por ID.
- Exportação CSV.
- Períodos de trabalho dos tipos `Campanha` e `Trabalho Semestral`.
- Histórico completo de designações.
- Conclusão de designações com cartas deixadas, observações e problemas.
- Bloqueio automático de redesignação semestral antes do prazo permitido.
- Menu contextual com botão direito na lista de prédios/vilas para criar designação.
- Relatórios separados para campanha e trabalho semestral.
- Interface responsiva para desktop, tablet e smartphone.

## Modos de trabalho

### Campanha

Use quando todos os prédios/vilas precisam ser trabalhados em um intervalo curto.

Regras:

- exige data de início e data de fim;
- permite designar prédios/vilas dentro do período;
- acompanha total, designados, concluídos, pendentes, percentual concluído e cartas deixadas;
- destaca pendências da campanha;
- gera relatório específico com responsáveis, problemas e observações.

### Trabalho Semestral

Use para o trabalho regular ao longo do ano.

Regras:

- representa um ciclo de aproximadamente 6 meses;
- ao designar, o sistema calcula `dataFimPrevista` como 6 meses após a data de início;
- um prédio/vila com designação ativa não pode ser redesignado antes de completar 6 meses;
- após conclusão, o prédio/vila fica 6 meses bloqueado para novo trabalho;
- o bloqueio é calculado pelo histórico de designações, não apenas pelo status atual;
- quando há bloqueio, o sistema informa a próxima data permitida.

## Stack

- [Next.js App Router](https://nextjs.org/docs/app)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zod
- Server Actions
- `xlsx` para leitura de planilhas
- Vercel para deploy

## Arquitetura

Estrutura principal:

```text
src/
  actions/
    importacao.ts
    periodos.ts
    predios.ts
  app/
    api/
    designacoes/
    importar/
    periodos/
    predios/
    relatorios/
    page.tsx
  components/
    designacoes/
    importar/
    layout/
    periodos/
    predios/
    ui/
  lib/
    prisma.ts
    trabalho.ts
    validations.ts
    xlsx-import.ts
  types/
    index.ts
prisma/
  migrations/
  schema.prisma
```

Domínios principais:

- `PredioVila`: cadastro base dos prédios e vilas.
- `PeriodoTrabalho`: campanhas e ciclos semestrais.
- `Designacao`: histórico de designações por período.
- `xlsx-import`: regras de leitura e validação da planilha original.
- `trabalho`: regras de progresso, datas e bloqueio semestral.

## Requisitos

- Node.js 20 ou superior.
- npm.
- Banco PostgreSQL.
- URL de conexão no formato `DATABASE_URL`.

## Instalação local

Clone o repositório e instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Configure a variável:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

Aplique as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Banco de dados

O projeto usa Prisma com PostgreSQL.

Comandos úteis:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio
```

Em produção, use:

```bash
npx prisma migrate deploy
```

## Importação de planilha

A planilha deve ter uma aba chamada `Campanha`.

Formato esperado:

- Linha 1: pode conter título.
- Linha 2: cabeçalhos.
- Linha 3 em diante: dados.

Mapeamento:

| Coluna | Campo |
| --- | --- |
| A | `id` |
| B | `nome` |
| C | `endereco` |
| D | `tipo` |
| E | `numero` |
| F | `quantidadeResidencias` |
| G | `modalidade` |
| H | `tipoRecepcao` |
| I | `responsavel` |
| J | `dataDesignacao` |
| K | `quadra` |
| L | `observacoes` |

Regras:

- Se o ID já existir, o registro é atualizado.
- Se o ID não existir, o registro é criado.
- `quantidadeResidencias` e `quadra` são convertidos para número.
- `dataDesignacao` é convertida para data quando existir.
- Sem responsável, o status inicial é `PENDENTE`.
- Com responsável, o status inicial é `DESIGNADO`.
- A importação exibe relatório com lidos, criados, atualizados e erros.

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Dashboard |
| `/predios` | Lista geral de prédios/vilas |
| `/predios/novo` | Novo prédio/vila |
| `/predios/[id]` | Detalhes |
| `/predios/[id]/editar` | Edição |
| `/periodos` | Períodos de trabalho |
| `/periodos/[id]` | Detalhes do período, progresso e designações |
| `/periodos/[id]/editar` | Edição do período |
| `/designacoes` | Controle geral de designações |
| `/importar` | Importação de planilha |
| `/relatorios` | Relatórios e exportações |
| `/configuracoes` | Dados básicos do sistema |

## Deploy

### Vercel

1. Crie ou conecte um banco PostgreSQL.
2. Configure `DATABASE_URL` nas variáveis de ambiente da Vercel.
3. Conecte o repositório GitHub ao projeto Vercel.
4. Garanta que as migrations foram aplicadas:

```bash
npx prisma migrate deploy
```

5. Faça o deploy.

O script de build executa:

```bash
prisma generate && next build
```

### Variáveis de ambiente

| Nome | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | String de conexão PostgreSQL usada pelo Prisma |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente local |
| `npm run build` | Gera Prisma Client e build de produção |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | Executa lint do Next.js |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migration local |
| `npm run prisma:deploy` | Aplica migrations em produção |
| `npm run prisma:studio` | Abre Prisma Studio |

## Qualidade e validação

Antes de abrir pull request ou publicar alterações, rode:

```bash
npm run lint
npm run build
```

Também valide manualmente:

- criação de período de campanha;
- criação de período semestral;
- designação por `/designacoes`;
- designação pelo botão direito em `/predios`;
- bloqueio semestral;
- conclusão com cartas, observações e problemas;
- relatórios em `/relatorios`.

## Contribuição

Contribuições são bem-vindas.

Leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de propor mudanças.

Resumo do fluxo:

1. Crie uma branch com nome descritivo.
2. Faça alterações pequenas e focadas.
3. Rode lint e build.
4. Descreva claramente o que foi alterado.
5. Abra um pull request.

## Código de conduta

Este projeto segue um código de conduta para manter colaboração respeitosa e produtiva.

Leia [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Segurança

Não publique credenciais, arquivos `.env`, dumps de banco ou dados pessoais.

Para reportar vulnerabilidades, siga [SECURITY.md](./SECURITY.md).

## Licença

Este projeto ainda não possui uma licença definida. Antes de redistribuir, reutilizar ou publicar como software aberto, adicione um arquivo `LICENSE` com a licença escolhida.
