import { Prisma, StatusPeriodoTrabalho, StatusPredioVila } from "@prisma/client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { FilterForm } from "@/components/predios/filter-form";
import { PredioMobileCard, PredioTableRow } from "@/components/predios/predio-context-items";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/trabalho";

export const dynamic = "force-dynamic";

function buildWhere(searchParams: Record<string, string | undefined>): Prisma.PredioVilaWhereInput {
  const busca = searchParams.busca?.trim();
  const status = searchParams.status as StatusPredioVila | undefined;
  const tipoRecepcao = searchParams.tipoRecepcao?.trim();
  const quadra = busca && Number.isFinite(Number(busca)) ? Number(busca) : undefined;

  return {
    ...(status && Object.values(StatusPredioVila).includes(status) ? { status } : {}),
    ...(tipoRecepcao ? { tipoRecepcao: { contains: tipoRecepcao, mode: "insensitive" } } : {}),
    ...(busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { endereco: { contains: busca, mode: "insensitive" } },
            { responsavel: { contains: busca, mode: "insensitive" } },
            { tipoRecepcao: { contains: busca, mode: "insensitive" } },
            ...(quadra !== undefined ? [{ quadra }] : []),
          ],
        }
      : {}),
  };
}

export default async function PrediosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const hoje = new Date();
  const [registros, periodosValidos] = await Promise.all([
    prisma.predioVila.findMany({
      where: buildWhere(params),
      orderBy: [{ quadra: "asc" }, { nome: "asc" }],
    }),
    prisma.periodoTrabalho.findMany({
      where: {
        status: { not: StatusPeriodoTrabalho.ENCERRADO },
        OR: [{ dataFim: null }, { dataFim: { gte: hoje } }],
      },
      orderBy: [{ status: "asc" }, { dataInicio: "desc" }],
    }),
  ]);
  const periodosOpcoes = periodosValidos.map((periodo) => ({
    id: periodo.id,
    nome: periodo.nome,
    tipo: periodo.tipo,
    intervalo: `${formatDate(periodo.dataInicio)} até ${formatDate(periodo.dataFim)}`,
  }));
  const registrosResumo = registros.map((item) => ({
    id: item.id,
    nome: item.nome,
    endereco: item.endereco,
    quadra: item.quadra,
    quantidadeResidencias: item.quantidadeResidencias,
    tipoRecepcao: item.tipoRecepcao,
    responsavel: item.responsavel,
    status: item.status,
  }));

  return (
    <>
      <PageHeader
        title="Prédios e vilas"
        description="Consulte, filtre e mantenha os registros da campanha."
        actions={<ButtonLink href="/predios/novo">Novo registro</ButtonLink>}
      />
      <Notice success={params.success} error={params.error} />
      <FilterForm busca={params.busca} status={params.status} tipoRecepcao={params.tipoRecepcao} />
      <p className="text-sm text-slate-600">
        No desktop, clique com o botão direito em um prédio/vila para criar uma designação em um período válido.
      </p>

      <div className="grid gap-3 md:hidden">
        {registrosResumo.map((item) => (
          <PredioMobileCard key={item.id} predio={item} periodos={periodosOpcoes} />
        ))}
        {registros.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
            Nenhum registro encontrado.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Endereço</th>
              <th className="px-4 py-3">Quadra</th>
              <th className="px-4 py-3">Residências</th>
              <th className="px-4 py-3">Recepção</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrosResumo.map((item) => (
              <PredioTableRow key={item.id} predio={item} periodos={periodosOpcoes} />
            ))}
            {registros.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
