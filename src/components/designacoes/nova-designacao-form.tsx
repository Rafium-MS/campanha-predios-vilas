"use client";

import type { PredioVila, TipoPeriodoTrabalho } from "@prisma/client";

import { criarDesignacaoPeriodo } from "@/actions/periodos";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { tipoPeriodoLabel } from "@/components/ui/status-badge";

export type PeriodoDesignacaoOpcao = {
  id: string;
  nome: string;
  tipo: TipoPeriodoTrabalho;
  intervalo: string;
};

export function NovaDesignacaoForm({
  periodos,
  predios,
  predioId,
  redirectTo,
  dataInicioPadrao,
  compact = false,
}: {
  periodos: PeriodoDesignacaoOpcao[];
  predios?: PredioVila[];
  predioId?: string;
  redirectTo: string;
  dataInicioPadrao: string;
  compact?: boolean;
}) {
  return (
    <form
      action={criarDesignacaoPeriodo}
      className={
        compact
          ? "grid gap-3"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1fr_220px_auto] xl:items-end"
      }
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {predioId ? (
        <input type="hidden" name="predioVilaId" value={predioId} />
      ) : (
        <Field label="Prédio/vila">
          <Select name="predioVilaId" required>
            <option value="">Selecione</option>
            {predios?.map((predio) => (
              <option key={predio.id} value={predio.id}>
                {predio.id} - {predio.nome} ({predio.endereco})
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Período válido">
        <Select name="periodoTrabalhoId" required>
          <option value="">Selecione</option>
          {periodos.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {periodo.nome} - {tipoPeriodoLabel(periodo.tipo)} ({periodo.intervalo})
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
      <Button type="submit" className={compact ? "w-full" : "w-full md:col-span-2 xl:col-span-1 xl:w-auto"}>
        Designar
      </Button>
    </form>
  );
}
