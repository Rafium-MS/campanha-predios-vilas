import { StatusDesignacao, StatusPeriodoTrabalho, StatusPredioVila, TipoPeriodoTrabalho } from "@prisma/client";

import { StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { verificarBloqueioSemestral } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalRegistros,
    residencias,
    pendentes,
    designados,
    concluidos,
    campanhaAtiva,
    semestralAtivo,
    designacoesEmAndamento,
    cartasPeriodoAtual,
    predios,
  ] = await Promise.all([
    prisma.predioVila.count(),
    prisma.predioVila.aggregate({ _sum: { quantidadeResidencias: true } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.PENDENTE } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.DESIGNADO } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.CONCLUIDO } }),
    prisma.periodoTrabalho.findFirst({
      where: { tipo: TipoPeriodoTrabalho.CAMPANHA, status: StatusPeriodoTrabalho.ATIVO },
      include: { designacoes: true },
      orderBy: { dataInicio: "desc" },
    }),
    prisma.periodoTrabalho.findFirst({
      where: { tipo: TipoPeriodoTrabalho.SEMESTRAL, status: StatusPeriodoTrabalho.ATIVO },
      include: { designacoes: true },
      orderBy: { dataInicio: "desc" },
    }),
    prisma.designacao.count({ where: { status: StatusDesignacao.EM_ANDAMENTO } }),
    prisma.designacao.aggregate({
      where: {
        periodoTrabalho: { status: StatusPeriodoTrabalho.ATIVO },
      },
      _sum: { quantidadeCartasDeixadas: true },
    }),
    prisma.predioVila.findMany({ select: { id: true } }),
  ]);

  const campanhaProgresso = campanhaAtiva
    ? `${campanhaAtiva.designacoes.filter((item) => item.status === StatusDesignacao.CONCLUIDO).length}/${totalRegistros}`
    : "Sem campanha";
  const bloqueios = await Promise.all(predios.map((predio) => verificarBloqueioSemestral(predio.id, new Date())));
  const totalBloqueados = bloqueios.filter((item) => item.bloqueado).length;
  const totalDisponiveis = Math.max(totalRegistros - totalBloqueados, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos registros da campanha, com totais e acompanhamento de status."
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total de registros" value={totalRegistros} />
        <StatCard title="Total de residências" value={residencias._sum.quantidadeResidencias ?? 0} />
        <StatCard title="Pendentes" value={pendentes} />
        <StatCard title="Designados" value={designados} />
        <StatCard title="Concluídos" value={concluidos} />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Campanha ativa" value={campanhaAtiva?.nome ?? "Nenhuma"} />
        <StatCard title="Progresso da campanha" value={campanhaProgresso} />
        <StatCard title="Período semestral ativo" value={semestralAtivo?.nome ?? "Nenhum"} />
        <StatCard title="Designações em andamento" value={designacoesEmAndamento} />
        <StatCard title="Bloqueados por prazo" value={totalBloqueados} />
        <StatCard title="Disponíveis para designação" value={totalDisponiveis} />
        <StatCard title="Cartas no período atual" value={cartasPeriodoAtual._sum.quantidadeCartasDeixadas ?? 0} />
      </section>
    </>
  );
}
