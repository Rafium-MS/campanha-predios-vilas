import { Prisma, StatusPredioVila } from "@prisma/client";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterForm } from "@/components/predios/filter-form";
import { prisma } from "@/lib/prisma";

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
  const registros = await prisma.predioVila.findMany({
    where: buildWhere(params),
    orderBy: [{ quadra: "asc" }, { nome: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Prédios e vilas"
        description="Consulte, filtre e mantenha os registros da campanha."
        actions={<ButtonLink href="/predios/novo">Novo registro</ButtonLink>}
      />
      <Notice success={params.success} error={params.error} />
      <FilterForm busca={params.busca} status={params.status} tipoRecepcao={params.tipoRecepcao} />

      <div className="grid gap-3 md:hidden">
        {registros.map((item) => (
          <Link
            key={item.id}
            href={`/predios/${item.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-slate-500">{item.id}</p>
                <h2 className="mt-1 truncate text-base font-semibold text-slate-950">{item.nome}</h2>
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
                <dt className="text-xs text-slate-500">Residências</dt>
                <dd className="font-medium text-slate-950">{item.quantidadeResidencias}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Recepção</dt>
                <dd className="truncate font-medium text-slate-950">{item.tipoRecepcao ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Responsável</dt>
                <dd className="truncate font-medium text-slate-950">{item.responsavel ?? "-"}</dd>
              </div>
            </dl>
          </Link>
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
            {registros.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/predios/${item.id}`} className="text-slate-950 underline-offset-4 hover:underline">
                    {item.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3">{item.endereco}</td>
                <td className="px-4 py-3">{item.quadra ?? "-"}</td>
                <td className="px-4 py-3">{item.quantidadeResidencias}</td>
                <td className="px-4 py-3">{item.tipoRecepcao ?? "-"}</td>
                <td className="px-4 py-3">{item.responsavel ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
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
