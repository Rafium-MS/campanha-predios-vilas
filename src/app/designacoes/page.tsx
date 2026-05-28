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
        <form action={designarPredioVila} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_220px_auto] xl:items-end">
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
          <Button type="submit" className="w-full md:col-span-2 xl:col-span-1 xl:w-auto">
            Designar
          </Button>
        </form>
      </Card>

      <div className="grid gap-3 md:hidden">
        {registros.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-950">{item.nome}</h2>
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
                <dt className="text-xs text-slate-500">Data</dt>
                <dd className="font-medium text-slate-950">
                  {item.dataDesignacao ? item.dataDesignacao.toLocaleDateString("pt-BR") : "-"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Responsável</dt>
                <dd className="truncate font-medium text-slate-950">{item.responsavel ?? "-"}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
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
