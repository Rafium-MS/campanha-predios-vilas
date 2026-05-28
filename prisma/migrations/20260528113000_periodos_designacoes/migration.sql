-- CreateEnum
CREATE TYPE "TipoPeriodoTrabalho" AS ENUM ('CAMPANHA', 'SEMESTRAL');

-- CreateEnum
CREATE TYPE "StatusPeriodoTrabalho" AS ENUM ('PLANEJADO', 'ATIVO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "StatusDesignacao" AS ENUM ('DESIGNADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'PENDENTE', 'BLOQUEADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "PeriodoTrabalho" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPeriodoTrabalho" NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" "StatusPeriodoTrabalho" NOT NULL DEFAULT 'PLANEJADO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodoTrabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designacao" (
    "id" TEXT NOT NULL,
    "predioVilaId" TEXT NOT NULL,
    "periodoTrabalhoId" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "dataDesignacao" TIMESTAMP(3) NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFimPrevista" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "status" "StatusDesignacao" NOT NULL DEFAULT 'DESIGNADO',
    "quantidadeCartasDeixadas" INTEGER NOT NULL DEFAULT 0,
    "observacoesDoDesignado" TEXT,
    "problemasEncontrados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeriodoTrabalho_tipo_idx" ON "PeriodoTrabalho"("tipo");

-- CreateIndex
CREATE INDEX "PeriodoTrabalho_status_idx" ON "PeriodoTrabalho"("status");

-- CreateIndex
CREATE INDEX "PeriodoTrabalho_dataInicio_idx" ON "PeriodoTrabalho"("dataInicio");

-- CreateIndex
CREATE INDEX "PeriodoTrabalho_dataFim_idx" ON "PeriodoTrabalho"("dataFim");

-- CreateIndex
CREATE INDEX "Designacao_predioVilaId_idx" ON "Designacao"("predioVilaId");

-- CreateIndex
CREATE INDEX "Designacao_periodoTrabalhoId_idx" ON "Designacao"("periodoTrabalhoId");

-- CreateIndex
CREATE INDEX "Designacao_responsavel_idx" ON "Designacao"("responsavel");

-- CreateIndex
CREATE INDEX "Designacao_status_idx" ON "Designacao"("status");

-- CreateIndex
CREATE INDEX "Designacao_dataInicio_idx" ON "Designacao"("dataInicio");

-- CreateIndex
CREATE INDEX "Designacao_dataFimPrevista_idx" ON "Designacao"("dataFimPrevista");

-- CreateIndex
CREATE INDEX "Designacao_dataConclusao_idx" ON "Designacao"("dataConclusao");

-- AddForeignKey
ALTER TABLE "Designacao" ADD CONSTRAINT "Designacao_predioVilaId_fkey" FOREIGN KEY ("predioVilaId") REFERENCES "PredioVila"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designacao" ADD CONSTRAINT "Designacao_periodoTrabalhoId_fkey" FOREIGN KEY ("periodoTrabalhoId") REFERENCES "PeriodoTrabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
