import { StatusPredioVila } from "@prisma/client";

import { StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalRegistros, residencias, pendentes, designados, concluidos] = await Promise.all([
    prisma.predioVila.count(),
    prisma.predioVila.aggregate({ _sum: { quantidadeResidencias: true } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.PENDENTE } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.DESIGNADO } }),
    prisma.predioVila.count({ where: { status: StatusPredioVila.CONCLUIDO } }),
  ]);

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
    </>
  );
}
