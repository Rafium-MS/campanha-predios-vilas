import { StatusPredioVila } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .pipe(z.number().int().nonnegative().optional());

const optionalDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) return undefined;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  })
  .optional();

export const predioVilaSchema = z.object({
  id: z.string().trim().min(1, "Informe o ID."),
  nome: z.string().trim().min(1, "Informe o nome."),
  endereco: z.string().trim().min(1, "Informe o endereço."),
  tipo: optionalText,
  numero: optionalText,
  quantidadeResidencias: optionalNumber.default(0),
  modalidade: optionalText,
  tipoRecepcao: optionalText,
  responsavel: optionalText,
  dataDesignacao: optionalDate,
  quadra: optionalNumber,
  observacoes: optionalText,
  status: z.nativeEnum(StatusPredioVila).optional(),
});

export const designacaoSchema = z.object({
  id: z.string().trim().min(1),
  responsavel: z.string().trim().min(1, "Informe o responsável."),
  dataDesignacao: optionalDate.refine(Boolean, "Informe a data da designação."),
});

export const importRowSchema = predioVilaSchema.extend({
  status: z.nativeEnum(StatusPredioVila),
});

export type PredioVilaInput = z.infer<typeof predioVilaSchema>;
export type DesignacaoInput = z.infer<typeof designacaoSchema>;
