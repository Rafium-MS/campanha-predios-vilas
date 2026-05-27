import type { PredioVila, StatusPredioVila } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { statusLabel } from "@/components/ui/status-badge";

const statuses: StatusPredioVila[] = ["PENDENTE", "DESIGNADO", "EM_ANDAMENTO", "CONCLUIDO", "REVISITAR"];

export function PredioForm({
  action,
  predio,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  predio?: PredioVila;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="ID">
          <Input name="id" defaultValue={predio?.id} required disabled={Boolean(predio)} />
        </Field>
        <Field label="Nome">
          <Input name="nome" defaultValue={predio?.nome} required />
        </Field>
        <Field label="Endereço">
          <Input name="endereco" defaultValue={predio?.endereco} required />
        </Field>
        <Field label="Tipo">
          <Input name="tipo" defaultValue={predio?.tipo ?? ""} />
        </Field>
        <Field label="Número">
          <Input name="numero" defaultValue={predio?.numero ?? ""} />
        </Field>
        <Field label="Quantidade de residências">
          <Input name="quantidadeResidencias" type="number" min="0" defaultValue={predio?.quantidadeResidencias ?? 0} />
        </Field>
        <Field label="Modalidade">
          <Input name="modalidade" defaultValue={predio?.modalidade ?? ""} />
        </Field>
        <Field label="Tipo de recepção">
          <Input name="tipoRecepcao" defaultValue={predio?.tipoRecepcao ?? ""} />
        </Field>
        <Field label="Responsável">
          <Input name="responsavel" defaultValue={predio?.responsavel ?? ""} />
        </Field>
        <Field label="Data da designação">
          <Input
            name="dataDesignacao"
            type="date"
            defaultValue={predio?.dataDesignacao ? predio.dataDesignacao.toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field label="Quadra">
          <Input name="quadra" type="number" min="0" defaultValue={predio?.quadra ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={predio?.status ?? "PENDENTE"}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Observações">
        <Textarea name="observacoes" defaultValue={predio?.observacoes ?? ""} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
