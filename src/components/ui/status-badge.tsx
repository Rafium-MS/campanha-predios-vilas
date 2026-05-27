import { StatusPredioVila } from "@prisma/client";

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
