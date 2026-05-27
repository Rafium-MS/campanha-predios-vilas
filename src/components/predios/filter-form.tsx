import { StatusPredioVila } from "@prisma/client";

import { ButtonLink, Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { statusLabel } from "@/components/ui/status-badge";

const statuses: StatusPredioVila[] = ["PENDENTE", "DESIGNADO", "EM_ANDAMENTO", "CONCLUIDO", "REVISITAR"];

export function FilterForm({
  busca,
  status,
  tipoRecepcao,
}: {
  busca?: string;
  status?: string;
  tipoRecepcao?: string;
}) {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px_auto_auto] md:items-end">
      <Field label="Busca">
        <Input name="busca" placeholder="Nome, endereço, quadra ou responsável" defaultValue={busca ?? ""} />
      </Field>
      <Field label="Status">
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">Todos</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Tipo de recepção">
        <Input name="tipoRecepcao" defaultValue={tipoRecepcao ?? ""} />
      </Field>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      <ButtonLink href="/predios" variant="secondary">
        Limpar
      </ButtonLink>
    </form>
  );
}
