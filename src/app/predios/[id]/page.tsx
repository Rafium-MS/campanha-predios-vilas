import { notFound } from "next/navigation";

import { excluirPredioVila } from "@/actions/predios";
import { DeleteForm } from "@/components/predios/delete-form";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PredioDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const predio = await prisma.predioVila.findUnique({ where: { id } });

  if (!predio) notFound();

  const deleteAction = excluirPredioVila.bind(null, predio.id);

  return (
    <>
      <PageHeader
        title={predio.nome}
        description={predio.endereco}
        actions={
          <>
            <ButtonLink href={`/predios/${predio.id}/editar`} variant="secondary">
              Editar
            </ButtonLink>
            <DeleteForm action={deleteAction} />
          </>
        }
      />
      <Notice success={query.success} error={query.error} />
      <Card>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">ID</dt>
            <dd className="font-medium">{predio.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={predio.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Tipo</dt>
            <dd>{predio.tipo ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Número</dt>
            <dd>{predio.numero ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Residências</dt>
            <dd>{predio.quantidadeResidencias}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Modalidade</dt>
            <dd>{predio.modalidade ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Tipo de recepção</dt>
            <dd>{predio.tipoRecepcao ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Responsável</dt>
            <dd>{predio.responsavel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Data da designação</dt>
            <dd>{predio.dataDesignacao ? predio.dataDesignacao.toLocaleDateString("pt-BR") : "-"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Quadra</dt>
            <dd>{predio.quadra ?? "-"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Observações</dt>
            <dd>{predio.observacoes ?? "-"}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
