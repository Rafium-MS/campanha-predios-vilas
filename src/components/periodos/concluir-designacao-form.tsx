"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { concluirDesignacaoPeriodo } from "@/actions/periodos";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : "Concluir"}
    </Button>
  );
}

export function ConcluirDesignacaoForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Concluir
      </Button>
    );
  }

  return (
    <form action={concluirDesignacaoPeriodo} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Quantidade de cartas deixadas">
        <Input name="quantidadeCartasDeixadas" type="number" min="0" defaultValue={0} required />
      </Field>
      <Field label="Observações do designado">
        <Textarea name="observacoesDoDesignado" />
      </Field>
      <Field label="Problemas encontrados">
        <Textarea name="problemasEncontrados" />
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
