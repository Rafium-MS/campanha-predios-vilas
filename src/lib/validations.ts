import { StatusDesignacao, StatusPeriodoTrabalho, StatusPredioVila, TipoPeriodoTrabalho } from "@prisma/client";
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

export const periodoTrabalhoSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome do período."),
    tipo: z.nativeEnum(TipoPeriodoTrabalho, { required_error: "Informe o tipo do período." }),
    dataInicio: optionalDate.refine(Boolean, "Informe a data de início."),
    dataFim: optionalDate,
    status: z.nativeEnum(StatusPeriodoTrabalho).default(StatusPeriodoTrabalho.PLANEJADO),
    observacoes: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.tipo === TipoPeriodoTrabalho.CAMPANHA && !data.dataFim) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataFim"],
        message: "Campanha precisa ter data de fim.",
      });
    }

    if (data.dataInicio && data.dataFim && data.dataFim < data.dataInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataFim"],
        message: "A data final deve ser maior ou igual à data inicial.",
      });
    }
  });

export const criarDesignacaoPeriodoSchema = z.object({
  predioVilaId: z.string().trim().min(1, "Selecione o prédio/vila."),
  periodoTrabalhoId: z.string().trim().min(1),
  responsavel: z.string().trim().min(1, "Informe o responsável."),
  dataInicio: optionalDate.refine(Boolean, "Informe a data de início."),
});

export const concluirDesignacaoSchema = z.object({
  id: z.string().trim().min(1),
  quantidadeCartasDeixadas: optionalNumber.default(0),
  observacoesDoDesignado: optionalText,
  problemasEncontrados: optionalText,
});

export const atualizarStatusDesignacaoSchema = z.object({
  id: z.string().trim().min(1),
  status: z.nativeEnum(StatusDesignacao),
});

export type PredioVilaInput = z.infer<typeof predioVilaSchema>;
export type DesignacaoInput = z.infer<typeof designacaoSchema>;
export type PeriodoTrabalhoInput = z.infer<typeof periodoTrabalhoSchema>;
