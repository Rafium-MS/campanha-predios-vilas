import type { PredioVila } from "@prisma/client";

import { criarDesignacaoPeriodo } from "@/actions/periodos";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function DesignacaoPeriodoForm({
  periodoId,
  predios,
  dataInicioPadrao,
}: {
  periodoId: string;
  predios: PredioVila[];
  dataInicioPadrao: string;
}) {
  return (
    <form action={criarDesignacaoPeriodo} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_220px_auto] xl:items-end">
      <input type="hidden" name="periodoTrabalhoId" value={periodoId} />
      <Field label="Prédio/vila">
        <Select name="predioVilaId" required>
          <option value="">Selecione</option>
          {predios.map((predio) => (
            <option key={predio.id} value={predio.id}>
              {predio.id} - {predio.nome} ({predio.endereco})
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Responsável">
        <Input name="responsavel" required />
      </Field>
      <Field label="Data de início">
        <Input name="dataInicio" type="date" defaultValue={dataInicioPadrao} required />
      </Field>
      <Button type="submit" className="w-full md:col-span-2 xl:col-span-1 xl:w-auto">
        Designar
      </Button>
    </form>
  );
}
