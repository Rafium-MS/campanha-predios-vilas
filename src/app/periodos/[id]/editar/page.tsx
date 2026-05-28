import { notFound } from "next/navigation";

import { atualizarPeriodoTrabalho } from "@/actions/periodos";
import { PeriodoForm } from "@/components/periodos/periodo-form";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditarPeriodoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const periodo = await prisma.periodoTrabalho.findUnique({ where: { id } });
  if (!periodo) notFound();

  return (
    <>
      <PageHeader title="Editar período" description={periodo.nome} />
      <Notice error={query.error} />
      <PeriodoForm action={atualizarPeriodoTrabalho.bind(null, periodo.id)} periodo={periodo} submitLabel="Salvar período" />
    </>
  );
}
