import { StatusPeriodoTrabalho, StatusPredioVila } from "@prisma/client";

import { NovaDesignacaoForm } from "@/components/designacoes/nova-designacao-form";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { DesignacaoStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

export default async function DesignacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const hoje = new Date();
  const [registros, periodosValidos, designacoesRecentes] = await Promise.all([
    prisma.predioVila.findMany({
      where: {
        status: { in: [StatusPredioVila.PENDENTE, StatusPredioVila.DESIGNADO, StatusPredioVila.EM_ANDAMENTO] },
      },
      orderBy: [{ status: "asc" }, { quadra: "asc" }, { nome: "asc" }],
    }),
    prisma.periodoTrabalho.findMany({
      where: {
        status: { not: StatusPeriodoTrabalho.ENCERRADO },
        OR: [{ dataFim: null }, { dataFim: { gte: hoje } }],
      },
      orderBy: [{ status: "asc" }, { dataInicio: "desc" }],
    }),
    prisma.designacao.findMany({
      include: { predioVila: true, periodoTrabalho: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  const periodosOpcoes = periodosValidos.map((periodo) => ({
    id: periodo.id,
    nome: periodo.nome,
    tipo: periodo.tipo,
    intervalo: `${formatDate(periodo.dataInicio)} até ${formatDate(periodo.dataFim)}`,
  }));

  return (
    <>
      <PageHeader
        title="Controle de designações"
        description="Crie designações vinculadas a uma campanha ou período semestral válido."
      />
      <Notice success={params.success} error={params.error} />
      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Nova designação</h2>
        {periodosOpcoes.length > 0 ? (
          <div className="mt-4">
            <NovaDesignacaoForm
              periodos={periodosOpcoes}
              predios={registros}
              redirectTo="/designacoes"
              dataInicioPadrao={hoje.toISOString().slice(0, 10)}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Não há períodos válidos. Crie ou ative um período em Períodos de trabalho.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Designações recentes</h2>
        <div className="mt-4 grid gap-3">
          {designacoesRecentes.map((designacao) => (
            <div key={designacao.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-slate-950">{designacao.predioVila.nome}</p>
                  <p className="text-sm text-slate-600">
                    {designacao.periodoTrabalho.nome} - {designacao.responsavel}
                  </p>
                </div>
                <DesignacaoStatusBadge status={designacao.status} />
              </div>
            </div>
          ))}
          {designacoesRecentes.length === 0 ? <p className="text-sm text-slate-500">Nenhuma designação registrada.</p> : null}
        </div>
      </Card>

      <div className="grid gap-3 md:hidden">
        {registros.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-950">{item.nome}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.endereco}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Quadra</dt>
                <dd className="font-medium text-slate-950">{item.quadra ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Data</dt>
                <dd className="font-medium text-slate-950">
                  {item.dataDesignacao ? item.dataDesignacao.toLocaleDateString("pt-BR") : "-"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Responsável</dt>
                <dd className="truncate font-medium text-slate-950">{item.responsavel ?? "-"}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Endereço</th>
              <th className="px-4 py-3">Quadra</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registros.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3">{item.endereco}</td>
                <td className="px-4 py-3">{item.quadra ?? "-"}</td>
                <td className="px-4 py-3">{item.responsavel ?? "-"}</td>
                <td className="px-4 py-3">{item.dataDesignacao ? item.dataDesignacao.toLocaleDateString("pt-BR") : "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
