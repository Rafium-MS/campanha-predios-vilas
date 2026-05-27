-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusPredioVila" AS ENUM ('PENDENTE', 'DESIGNADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'REVISITAR');

-- CreateTable
CREATE TABLE "PredioVila" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "tipo" TEXT,
    "numero" TEXT,
    "quantidadeResidencias" INTEGER NOT NULL DEFAULT 0,
    "modalidade" TEXT,
    "tipoRecepcao" TEXT,
    "responsavel" TEXT,
    "dataDesignacao" TIMESTAMP(3),
    "quadra" INTEGER,
    "observacoes" TEXT,
    "status" "StatusPredioVila" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredioVila_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PredioVila_nome_idx" ON "PredioVila"("nome");

-- CreateIndex
CREATE INDEX "PredioVila_endereco_idx" ON "PredioVila"("endereco");

-- CreateIndex
CREATE INDEX "PredioVila_quadra_idx" ON "PredioVila"("quadra");

-- CreateIndex
CREATE INDEX "PredioVila_responsavel_idx" ON "PredioVila"("responsavel");

-- CreateIndex
CREATE INDEX "PredioVila_status_idx" ON "PredioVila"("status");

-- CreateIndex
CREATE INDEX "PredioVila_tipoRecepcao_idx" ON "PredioVila"("tipoRecepcao");
