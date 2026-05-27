import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados básicos do sistema e referências usadas na campanha."
      />
      <Card>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Sistema</dt>
            <dd className="font-medium">Campanha Prédios e Vilas</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Banco de dados</dt>
            <dd className="font-medium">PostgreSQL via Prisma</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Importação</dt>
            <dd className="font-medium">Arquivo .xlsx, aba Campanha</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Exportação</dt>
            <dd className="font-medium">CSV em /relatorios</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
