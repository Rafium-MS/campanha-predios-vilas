import { ImportForm } from "@/components/importar/import-form";
import { PageHeader } from "@/components/ui/page-header";

export default function ImportarPage() {
  return (
    <>
      <PageHeader
        title="Importar planilha"
        description='Envie um arquivo .xlsx com a aba "Campanha". A linha 2 deve conter os cabeçalhos e os dados começam na linha 3.'
      />
      <ImportForm />
    </>
  );
}
