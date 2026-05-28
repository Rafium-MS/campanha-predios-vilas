import { StatusDesignacao, TipoPeriodoTrabalho } from "@prisma/client";
import { notFound } from "next/navigation";

import { encerrarPeriodoTrabalho } from "@/actions/periodos";
import { ConcluirDesignacaoForm } from "@/components/periodos/concluir-designacao-form";
import { DesignacaoPeriodoForm } from "@/components/periodos/designacao-periodo-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import {
  DesignacaoStatusBadge,
  PeriodoStatusBadge,
  TipoPeriodoBadge,
} from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { calcularProgressoPeriodo, formatDate, verificarBloqueioSemestral } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

function EncerrarForm({ id }: { id: string }) {
  return (
    <form action={encerrarPeriodoTrabalho.bind(null, id)}>
      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
        Encerrar período
      </Button>
    </form>
  );
}

export default async function PeriodoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [periodo, totalPredios, predios] = await Promise.all([
    prisma.periodoTrabalho.findUnique({
      where: { id },
      include: {
        designacoes: {
          include: { predioVila: true },
          orderBy: [{ status: "asc" }, { dataInicio: "desc" }],
        },
      },
    }),
    prisma.predioVila.count(),
    prisma.predioVila.findMany({ orderBy: [{ quadra: "asc" }, { nome: "asc" }] }),
  ]);

  if (!periodo) notFound();

  const prediosDesignados = new Set(periodo.designacoes.map((item) => item.predioVilaId));
  const prediosDisponiveisNoPeriodo = predios.filter((predio) => !prediosDesignados.has(predio.id));
  const progresso = calcularProgressoPeriodo(totalPredios, periodo.designacoes);
  const dataInicioPadrao = new Date().toISOString().slice(0, 10);
  const bloqueios = await Promise.all(
    predios.map(async (predio) => ({
      predio,
      bloqueio:
        periodo.tipo === TipoPeriodoTrabalho.SEMESTRAL
          ? await verificarBloqueioSemestral(predio.id, new Date())
          : { bloqueado: false, proximaDataPermitida: null },
    })),
  );
  const bloqueados = bloqueios.filter((item) => item.bloqueio.bloqueado);

  return (
    <>
      <PageHeader
        title={periodo.nome}
        description={`${formatDate(periodo.dataInicio)} até ${formatDate(periodo.dataFim)}`}
        actions={
          <>
            <ButtonLink href={`/periodos/${periodo.id}/editar`} variant="secondary">
              Editar
            </ButtonLink>
            <EncerrarForm id={periodo.id} />
          </>
        }
      />
      <Notice success={query.success} error={query.error} />

      <Card>
        <div className="flex flex-wrap gap-2">
          <TipoPeriodoBadge tipo={periodo.tipo} />
          <PeriodoStatusBadge status={periodo.status} />
        </div>
        {periodo.observacoes ? <p className="mt-3 text-sm text-slate-600">{periodo.observacoes}</p> : null}
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total de prédios/vilas" value={progresso.totalPredios} />
        <StatCard title="Designados" value={progresso.totalDesignado} />
        <StatCard title="Concluídos" value={progresso.totalConcluido} />
        <StatCard title="Pendentes" value={progresso.totalPendente} />
        <StatCard title="Concluído" value={`${progresso.percentualConcluido}%`} />
        <StatCard title="Cartas deixadas" value={progresso.totalCartas} />
      </section>

      {bloqueados.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>{bloqueados.length} prédio(s)/vila(s) bloqueado(s) por prazo.</strong>
          <div className="mt-2 grid gap-1">
            {bloqueados.slice(0, 5).map((item) => (
              <span key={item.predio.id}>
                {item.predio.nome}: próxima data permitida {formatDate(item.bloqueio.proximaDataPermitida)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Nova designação</h2>
        <div className="mt-4">
          <DesignacaoPeriodoForm
            periodoId={periodo.id}
            predios={prediosDisponiveisNoPeriodo}
            dataInicioPadrao={dataInicioPadrao}
          />
        </div>
      </Card>

      <div className="grid gap-3">
        {periodo.designacoes.map((designacao) => (
          <Card key={designacao.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">{designacao.predioVila.id}</p>
                    <h2 className="text-lg font-semibold text-slate-950">{designacao.predioVila.nome}</h2>
                    <p className="text-sm text-slate-600">{designacao.predioVila.endereco}</p>
                  </div>
                  <DesignacaoStatusBadge status={designacao.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs text-slate-500">Responsável</dt>
                    <dd className="font-medium">{designacao.responsavel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Início</dt>
                    <dd className="font-medium">{formatDate(designacao.dataInicio)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Fim previsto</dt>
                    <dd className="font-medium">{formatDate(designacao.dataFimPrevista)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Cartas</dt>
                    <dd className="font-medium">{designacao.quantidadeCartasDeixadas}</dd>
                  </div>
                </dl>
                {periodo.tipo === TipoPeriodoTrabalho.CAMPANHA && designacao.status !== StatusDesignacao.CONCLUIDO ? (
                  <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Pendente na campanha.</p>
                ) : null}
                {designacao.problemasEncontrados ? (
                  <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                    {designacao.problemasEncontrados}
                  </p>
                ) : null}
                {designacao.observacoesDoDesignado ? (
                  <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {designacao.observacoesDoDesignado}
                  </p>
                ) : null}
              </div>
              <div>
                {designacao.status !== StatusDesignacao.CONCLUIDO ? (
                  <ConcluirDesignacaoForm id={designacao.id} />
                ) : (
                  <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Concluído em {formatDate(designacao.dataConclusao)}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
        {periodo.designacoes.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
            Nenhuma designação registrada neste período.
          </div>
        ) : null}
      </div>
    </>
  );
}
