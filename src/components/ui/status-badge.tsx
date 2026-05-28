import { StatusDesignacao, StatusPeriodoTrabalho, StatusPredioVila, TipoPeriodoTrabalho } from "@prisma/client";

const labels: Record<StatusPredioVila, string> = {
  PENDENTE: "Pendente",
  DESIGNADO: "Designado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  REVISITAR: "Revisitar",
};

const styles: Record<StatusPredioVila, string> = {
  PENDENTE: "bg-amber-50 text-amber-800 border-amber-200",
  DESIGNADO: "bg-sky-50 text-sky-800 border-sky-200",
  EM_ANDAMENTO: "bg-indigo-50 text-indigo-800 border-indigo-200",
  CONCLUIDO: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REVISITAR: "bg-rose-50 text-rose-800 border-rose-200",
};

export function statusLabel(status: StatusPredioVila) {
  return labels[status];
}

export function StatusBadge({ status }: { status: StatusPredioVila }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

const periodoLabels: Record<StatusPeriodoTrabalho, string> = {
  PLANEJADO: "Planejado",
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
};

const periodoStyles: Record<StatusPeriodoTrabalho, string> = {
  PLANEJADO: "bg-slate-50 text-slate-800 border-slate-200",
  ATIVO: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ENCERRADO: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const tipoLabels: Record<TipoPeriodoTrabalho, string> = {
  CAMPANHA: "Campanha",
  SEMESTRAL: "Trabalho semestral",
};

const tipoStyles: Record<TipoPeriodoTrabalho, string> = {
  CAMPANHA: "bg-violet-50 text-violet-800 border-violet-200",
  SEMESTRAL: "bg-teal-50 text-teal-800 border-teal-200",
};

const designacaoLabels: Record<StatusDesignacao, string> = {
  DESIGNADO: "Designado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  PENDENTE: "Pendente",
  BLOQUEADO: "Bloqueado",
  CANCELADO: "Cancelado",
};

const designacaoStyles: Record<StatusDesignacao, string> = {
  DESIGNADO: "bg-sky-50 text-sky-800 border-sky-200",
  EM_ANDAMENTO: "bg-indigo-50 text-indigo-800 border-indigo-200",
  CONCLUIDO: "bg-emerald-50 text-emerald-800 border-emerald-200",
  PENDENTE: "bg-amber-50 text-amber-800 border-amber-200",
  BLOQUEADO: "bg-red-50 text-red-800 border-red-200",
  CANCELADO: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export function periodoStatusLabel(status: StatusPeriodoTrabalho) {
  return periodoLabels[status];
}

export function tipoPeriodoLabel(tipo: TipoPeriodoTrabalho) {
  return tipoLabels[tipo];
}

export function designacaoStatusLabel(status: StatusDesignacao) {
  return designacaoLabels[status];
}

export function PeriodoStatusBadge({ status }: { status: StatusPeriodoTrabalho }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${periodoStyles[status]}`}>
      {periodoLabels[status]}
    </span>
  );
}

export function TipoPeriodoBadge({ tipo }: { tipo: TipoPeriodoTrabalho }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tipoStyles[tipo]}`}>
      {tipoLabels[tipo]}
    </span>
  );
}

export function DesignacaoStatusBadge({ status }: { status: StatusDesignacao }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${designacaoStyles[status]}`}>
      {designacaoLabels[status]}
    </span>
  );
}
