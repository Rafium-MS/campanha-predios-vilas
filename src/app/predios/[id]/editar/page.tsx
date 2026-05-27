import { notFound } from "next/navigation";

import { atualizarPredioVila } from "@/actions/predios";
import { PredioForm } from "@/components/predios/predio-form";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditarPredioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const predio = await prisma.predioVila.findUnique({ where: { id } });
  if (!predio) notFound();

  const action = atualizarPredioVila.bind(null, predio.id);

  return (
    <>
      <PageHeader title="Editar registro" description={`${predio.nome} - ${predio.endereco}`} />
      <Notice error={query.error} />
      <PredioForm action={action} predio={predio} submitLabel="Salvar alterações" />
    </>
  );
}
