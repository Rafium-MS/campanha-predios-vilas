import { StatusDesignacao, StatusPredioVila, TipoPeriodoTrabalho } from "@prisma/client";

import { ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { calcularProgressoPeriodo, formatDate, verificarBloqueioSemestral } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const [total, residencias, porStatus, periodos, predios] = await Promise.all([
    prisma.predioVila.count(),
    prisma.predioVila.aggregate({ _sum: { quantidadeResidencias: true } }),
    prisma.predioVila.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { status: "asc" },
    }),
    prisma.periodoTrabalho.findMany({
      include: {
        designacoes: {
          include: { predioVila: true },
        },
      },
      orderBy: [{ tipo: "asc" }, { dataInicio: "desc" }],
    }),
    prisma.predioVila.findMany({ orderBy: [{ quadra: "asc" }, { nome: "asc" }] }),
  ]);

  const statusMap = new Map(porStatus.map((item) => [item.status, item._count.status]));
  const campanhas = periodos.filter((periodo) => periodo.tipo === TipoPeriodoTrabalho.CAMPANHA);
  const semestrais = periodos.filter((periodo) => periodo.tipo === TipoPeriodoTrabalho.SEMESTRAL);
  const bloqueios = await Promise.all(
    predios.map(async (predio) => ({ predio, bloqueio: await verificarBloqueioSemestral(predio.id, new Date()) })),
  );

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

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Relatório de Campanha</h2>
        <div className="mt-4 grid gap-4">
          {campanhas.map((periodo) => {
            const progresso = calcularProgressoPeriodo(total, periodo.designacoes);
            const porResponsavel = periodo.designacoes.reduce<Record<string, number>>((acc, item) => {
              acc[item.responsavel] = (acc[item.responsavel] ?? 0) + 1;
              return acc;
            }, {});
            const problemas = periodo.designacoes.filter((item) => item.problemasEncontrados);
            const observacoes = periodo.designacoes.filter((item) => item.observacoesDoDesignado);

            return (
              <div key={periodo.id} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-950">{periodo.nome}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(periodo.dataInicio)} até {formatDate(periodo.dataFim)}
                </p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
                  <div><dt className="text-slate-500">Total</dt><dd className="font-medium">{progresso.totalPredios}</dd></div>
                  <div><dt className="text-slate-500">Trabalhado</dt><dd className="font-medium">{progresso.totalConcluido}</dd></div>
                  <div><dt className="text-slate-500">Pendente</dt><dd className="font-medium">{progresso.totalPendente}</dd></div>
                  <div><dt className="text-slate-500">Cartas</dt><dd className="font-medium">{progresso.totalCartas}</dd></div>
                  <div><dt className="text-slate-500">Concluído</dt><dd className="font-medium">{progresso.percentualConcluido}%</dd></div>
                </dl>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold">Por responsável</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {Object.entries(porResponsavel).map(([responsavel, count]) => (
                        <li key={responsavel}>{responsavel}: {count}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Problemas</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {problemas.map((item) => <li key={item.id}>{item.predioVila.nome}: {item.problemasEncontrados}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Observações</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {observacoes.map((item) => <li key={item.id}>{item.predioVila.nome}: {item.observacoesDoDesignado}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
          {campanhas.length === 0 ? <p className="text-sm text-slate-500">Nenhuma campanha registrada.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Relatório Semestral</h2>
        <div className="mt-4 grid gap-4">
          {semestrais.map((periodo) => {
            const totalConcluido = periodo.designacoes.filter((item) => item.status === StatusDesignacao.CONCLUIDO).length;
            const totalEmAndamento = periodo.designacoes.filter((item) =>
              item.status === StatusDesignacao.DESIGNADO || item.status === StatusDesignacao.EM_ANDAMENTO,
            ).length;
            const totalCartas = periodo.designacoes.reduce((sum, item) => sum + item.quantidadeCartasDeixadas, 0);
            const problemas = periodo.designacoes.filter((item) => item.problemasEncontrados);
            const observacoes = periodo.designacoes.filter((item) => item.observacoesDoDesignado);
            const designadosIds = new Set(periodo.designacoes.map((item) => item.predioVilaId));
            const podemTrabalhar = bloqueios.filter((item) => !item.bloqueio.bloqueado && !designadosIds.has(item.predio.id));
            const bloqueados = bloqueios.filter((item) => item.bloqueio.bloqueado);

            return (
              <div key={periodo.id} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-950">{periodo.nome}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(periodo.dataInicio)} até {formatDate(periodo.dataFim)}
                </p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-slate-500">Designados</dt><dd className="font-medium">{periodo.designacoes.length}</dd></div>
                  <div><dt className="text-slate-500">Concluídos</dt><dd className="font-medium">{totalConcluido}</dd></div>
                  <div><dt className="text-slate-500">Em andamento</dt><dd className="font-medium">{totalEmAndamento}</dd></div>
                  <div><dt className="text-slate-500">Cartas</dt><dd className="font-medium">{totalCartas}</dd></div>
                </dl>
                <div className="mt-4 grid gap-4 lg:grid-cols-4">
                  <div>
                    <h4 className="text-sm font-semibold">Liberados</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {podemTrabalhar.slice(0, 12).map((item) => <li key={item.predio.id}>{item.predio.nome}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Bloqueados</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {bloqueados.slice(0, 12).map((item) => (
                        <li key={item.predio.id}>{item.predio.nome}: {formatDate(item.bloqueio.proximaDataPermitida)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Problemas</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {problemas.map((item) => <li key={item.id}>{item.predioVila.nome}: {item.problemasEncontrados}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Observações</h4>
                    <ul className="mt-2 text-sm text-slate-600">
                      {observacoes.map((item) => <li key={item.id}>{item.predioVila.nome}: {item.observacoesDoDesignado}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
          {semestrais.length === 0 ? <p className="text-sm text-slate-500">Nenhum período semestral registrado.</p> : null}
        </div>
      </Card>
    </>
  );
}
