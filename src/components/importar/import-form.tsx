"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { importarCampanha } from "@/actions/importacao";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ImportReport } from "@/types";

const initialState: ImportReport = {
  totalLido: 0,
  totalCriado: 0,
  totalAtualizado: 0,
  totalComErro: 0,
  erros: [],
};

async function action(_state: ImportReport, formData: FormData) {
  return importarCampanha(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Importando..." : "Importar planilha"}
    </Button>
  );
}

export function ImportForm() {
  const [report, formAction] = useActionState(action, initialState);

  return (
    <div className="grid gap-5">
      <form action={formAction} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          <span>Arquivo .xlsx</span>
          <input
            name="arquivo"
            type="file"
            accept=".xlsx"
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>
        <div>
          <SubmitButton />
        </div>
      </form>

      {(report.totalLido > 0 || report.totalComErro > 0) && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Relatório da importação</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-slate-500">Total lido</dt>
              <dd className="text-2xl font-semibold">{report.totalLido}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Criados</dt>
              <dd className="text-2xl font-semibold">{report.totalCriado}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Atualizados</dt>
              <dd className="text-2xl font-semibold">{report.totalAtualizado}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Com erro</dt>
              <dd className="text-2xl font-semibold">{report.totalComErro}</dd>
            </div>
          </dl>
          {report.erros.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Linha</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.erros.map((erro, index) => (
                    <tr key={`${erro.linha}-${index}`}>
                      <td className="px-3 py-2">{erro.linha || "-"}</td>
                      <td className="px-3 py-2">{erro.id ?? "-"}</td>
                      <td className="px-3 py-2">{erro.mensagem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
