import { criarPredioVila } from "@/actions/predios";
import { PredioForm } from "@/components/predios/predio-form";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";

export default async function NovoPredioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHeader title="Novo prédio ou vila" description="Cadastre um novo endereço para a campanha." />
      <Notice error={params.error} />
      <PredioForm action={criarPredioVila} submitLabel="Criar registro" />
    </>
  );
}
