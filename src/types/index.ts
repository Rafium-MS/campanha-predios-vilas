import type { StatusPredioVila } from "@prisma/client";

export type ActionState = {
  ok: boolean;
  message: string;
};

export type ImportReport = {
  totalLido: number;
  totalCriado: number;
  totalAtualizado: number;
  totalComErro: number;
  erros: Array<{
    linha: number;
    id?: string;
    mensagem: string;
  }>;
};

export type PredioVilaFilters = {
  busca?: string;
  status?: StatusPredioVila | "";
  tipoRecepcao?: string;
};
