import { StatusPredioVila } from "@prisma/client";

import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const [total, residencias, porStatus] = await Promise.all([
    prisma.predioVila.count(),
    prisma.predioVila.aggregate({ _sum: { quantidadeResidencias: true } }),
    prisma.predioVila.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const statusMap = new Map(porStatus.map((item) => [item.status, item._count.status]));

  return (
    <>
      <PageHeader
        title="Relatórios e exportações"
        description="Acompanhe os totais consolidados e exporte a base para CSV."
        actions={<ButtonLink href="/api/relatorios/predios.csv">Exportar CSV</ButtonLink>}
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Registros" value={total} />
        <StatCard title="Residências" value={residencias._sum.quantidadeResidencias ?? 0} />
        <StatCard title="Pendentes" value={statusMap.get(StatusPredioVila.PENDENTE) ?? 0} />
        <StatCard title="Concluídos" value={statusMap.get(StatusPredioVila.CONCLUIDO) ?? 0} />
      </section>
      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Registros por status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.values(StatusPredioVila).map((status) => (
            <div key={status} className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{status.replace("_", " ")}</p>
              <p className="mt-1 text-2xl font-semibold">{statusMap.get(status) ?? 0}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
