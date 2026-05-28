import type { PeriodoTrabalho, StatusPeriodoTrabalho, TipoPeriodoTrabalho } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { periodoStatusLabel, tipoPeriodoLabel } from "@/components/ui/status-badge";

const tipos: TipoPeriodoTrabalho[] = ["CAMPANHA", "SEMESTRAL"];
const statuses: StatusPeriodoTrabalho[] = ["PLANEJADO", "ATIVO", "ENCERRADO"];

export function PeriodoForm({
  action,
  periodo,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  periodo?: PeriodoTrabalho;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Nome">
          <Input name="nome" defaultValue={periodo?.nome ?? ""} required />
        </Field>
        <Field label="Tipo">
          <Select name="tipo" defaultValue={periodo?.tipo ?? "CAMPANHA"} required>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipoPeriodoLabel(tipo)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data de início">
          <Input name="dataInicio" type="date" defaultValue={periodo?.dataInicio.toISOString().slice(0, 10) ?? ""} required />
        </Field>
        <Field label="Data de fim">
          <Input name="dataFim" type="date" defaultValue={periodo?.dataFim?.toISOString().slice(0, 10) ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={periodo?.status ?? "PLANEJADO"}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {periodoStatusLabel(status)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Observações">
        <Textarea name="observacoes" defaultValue={periodo?.observacoes ?? ""} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
