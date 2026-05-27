import { StatusPredioVila } from "@prisma/client";

import { designarPredioVila } from "@/actions/predios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DesignacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const registros = await prisma.predioVila.findMany({
    where: {
      status: { in: [StatusPredioVila.PENDENTE, StatusPredioVila.DESIGNADO, StatusPredioVila.EM_ANDAMENTO] },
    },
    orderBy: [{ status: "asc" }, { quadra: "asc" }, { nome: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Controle de designações"
        description="Selecione um registro pendente ou em andamento e informe o responsável e a data da designação."
      />
      <Notice success={params.success} error={params.error} />
      <Card>
        <form action={designarPredioVila} className="grid gap-4 lg:grid-cols-[1.5fr_1fr_220px_auto] lg:items-end">
          <Field label="Registro">
            <Select name="id" required>
              <option value="">Selecione</option>
              {registros.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} - {item.nome} ({item.endereco})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Responsável">
            <Input name="responsavel" required />
          </Field>
          <Field label="Data">
            <Input name="dataDesignacao" type="date" required />
          </Field>
          <Button type="submit">Designar</Button>
        </form>
      </Card>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Endereço</th>
              <th className="px-4 py-3">Quadra</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registros.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3">{item.endereco}</td>
                <td className="px-4 py-3">{item.quadra ?? "-"}</td>
                <td className="px-4 py-3">{item.responsavel ?? "-"}</td>
                <td className="px-4 py-3">{item.dataDesignacao ? item.dataDesignacao.toLocaleDateString("pt-BR") : "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
