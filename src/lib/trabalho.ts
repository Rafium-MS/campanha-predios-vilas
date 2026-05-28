import { StatusDesignacao, TipoPeriodoTrabalho } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDate(date?: Date | null) {
  return date ? date.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";
}

function maxDate(current: Date | null, next: Date) {
  if (!current) return next;
  return next.getTime() > current.getTime() ? next : current;
}

export async function verificarBloqueioSemestral(predioVilaId: string, dataInicio: Date) {
  const designacoes = await prisma.designacao.findMany({
    where: {
      predioVilaId,
      periodoTrabalho: { tipo: TipoPeriodoTrabalho.SEMESTRAL },
      status: { not: StatusDesignacao.CANCELADO },
    },
    include: { periodoTrabalho: true },
    orderBy: [{ dataInicio: "desc" }, { createdAt: "desc" }],
  });

  let proximaDataPermitida: Date | null = null;

  for (const designacao of designacoes) {
    if (
      (designacao.status === StatusDesignacao.DESIGNADO ||
        designacao.status === StatusDesignacao.EM_ANDAMENTO ||
        designacao.status === StatusDesignacao.BLOQUEADO) &&
      designacao.dataFimPrevista &&
      designacao.dataFimPrevista > dataInicio
    ) {
      proximaDataPermitida = maxDate(proximaDataPermitida, designacao.dataFimPrevista);
    }

    if (designacao.status === StatusDesignacao.CONCLUIDO && designacao.dataConclusao) {
      const liberadoEm = addMonths(designacao.dataConclusao, 6);
      if (liberadoEm > dataInicio) {
        proximaDataPermitida = maxDate(proximaDataPermitida, liberadoEm);
      }
    }
  }

  return {
    bloqueado: Boolean(proximaDataPermitida),
    proximaDataPermitida,
  };
}

export function calcularProgressoPeriodo(totalPredios: number, designacoes: Array<{ status: StatusDesignacao; quantidadeCartasDeixadas: number }>) {
  const totalDesignado = designacoes.length;
  const totalConcluido = designacoes.filter((item) => item.status === StatusDesignacao.CONCLUIDO).length;
  const totalPendente = Math.max(totalPredios - totalDesignado, 0);
  const totalCartas = designacoes.reduce((sum, item) => sum + item.quantidadeCartasDeixadas, 0);

  return {
    totalPredios,
    totalDesignado,
    totalConcluido,
    totalPendente,
    percentualConcluido: totalPredios > 0 ? Math.round((totalConcluido / totalPredios) * 100) : 0,
    totalCartas,
  };
}
