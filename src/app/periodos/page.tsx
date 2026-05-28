import { Prisma, StatusPeriodoTrabalho, TipoPeriodoTrabalho } from "@prisma/client";
import Link from "next/link";

import { criarPeriodoTrabalho } from "@/actions/periodos";
import { PeriodoForm } from "@/components/periodos/periodo-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodoStatusBadge, TipoPeriodoBadge, periodoStatusLabel, tipoPeriodoLabel } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

const tipos: TipoPeriodoTrabalho[] = ["CAMPANHA", "SEMESTRAL"];
const statuses: StatusPeriodoTrabalho[] = ["PLANEJADO", "ATIVO", "ENCERRADO"];

function buildWhere(params: Record<string, string | undefined>): Prisma.PeriodoTrabalhoWhereInput {
  const tipo = params.tipo as TipoPeriodoTrabalho | undefined;
  const status = params.status as StatusPeriodoTrabalho | undefined;

  return {
    ...(tipo && Object.values(TipoPeriodoTrabalho).includes(tipo) ? { tipo } : {}),
    ...(status && Object.values(StatusPeriodoTrabalho).includes(status) ? { status } : {}),
  };
}

export default async function PeriodosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const periodos = await prisma.periodoTrabalho.findMany({
    where: buildWhere(params),
    include: { _count: { select: { designacoes: true } } },
    orderBy: [{ status: "asc" }, { dataInicio: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Períodos de trabalho"
        description="Controle campanhas pontuais e ciclos regulares de trabalho semestral."
      />
      <Notice success={params.success} error={params.error} />

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Novo período</h2>
        <div className="mt-4">
          <PeriodoForm action={criarPeriodoTrabalho} submitLabel="Criar período" />
        </div>
      </Card>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[220px_220px_auto_auto] sm:items-end">
        <Field label="Tipo">
          <Select name="tipo" defaultValue={params.tipo ?? ""}>
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipoPeriodoLabel(tipo)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {periodoStatusLabel(status)}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          Filtrar
        </Button>
        <ButtonLink href="/periodos" variant="secondary" className="w-full sm:w-auto">
          Limpar
        </ButtonLink>
      </form>

      <div className="grid gap-3">
        {periodos.map((periodo) => (
          <Link
            key={periodo.id}
            href={`/periodos/${periodo.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{periodo.nome}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(periodo.dataInicio)} até {formatDate(periodo.dataFim)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <TipoPeriodoBadge tipo={periodo.tipo} />
                <PeriodoStatusBadge status={periodo.status} />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{periodo._count.designacoes} designações registradas</p>
          </Link>
        ))}
        {periodos.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
            Nenhum período encontrado.
          </div>
        ) : null}
      </div>
    </>
  );
}
