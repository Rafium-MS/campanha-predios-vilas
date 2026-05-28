"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { NovaDesignacaoForm, type PeriodoDesignacaoOpcao } from "@/components/designacoes/nova-designacao-form";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusPredioVila } from "@prisma/client";

export type PredioResumo = {
  id: string;
  nome: string;
  endereco: string;
  quadra: number | null;
  quantidadeResidencias: number;
  tipoRecepcao: string | null;
  responsavel: string | null;
  status: StatusPredioVila;
};

function ContextMenu({
  predio,
  periodos,
  position,
  onClose,
}: {
  predio: PredioResumo;
  periodos: PeriodoDesignacaoOpcao[];
  position: { x: number; y: number } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!position) return;
    const close = () => onClose();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, position]);

  if (!position) return null;

  return (
    <div
      className="fixed z-50 w-[min(360px,calc(100vw-24px))] rounded-lg border border-slate-200 bg-white p-4 text-left shadow-xl"
      style={{ left: Math.min(position.x, window.innerWidth - 372), top: position.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-3">
        <p className="text-xs font-medium uppercase text-slate-500">Adicionar designação</p>
        <p className="mt-1 font-semibold text-slate-950">{predio.nome}</p>
      </div>
      {periodos.length > 0 ? (
        <NovaDesignacaoForm
          periodos={periodos}
          predioId={predio.id}
          redirectTo="/predios"
          dataInicioPadrao={new Date().toISOString().slice(0, 10)}
          compact
        />
      ) : (
        <p className="text-sm text-slate-600">Não há períodos válidos para receber novas designações.</p>
      )}
    </div>
  );
}

function WithContext({
  predio,
  periodos,
  children,
  className,
}: {
  predio: PredioResumo;
  periodos: PeriodoDesignacaoOpcao[];
  children: ReactNode;
  className?: string;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className={className}
      onContextMenu={(event) => {
        event.preventDefault();
        setPosition({ x: event.clientX, y: event.clientY });
      }}
    >
      {children}
      <ContextMenu predio={predio} periodos={periodos} position={position} onClose={() => setPosition(null)} />
    </div>
  );
}

export function PredioMobileCard({ predio, periodos }: { predio: PredioResumo; periodos: PeriodoDesignacaoOpcao[] }) {
  return (
    <WithContext predio={predio} periodos={periodos}>
      <Link
        href={`/predios/${predio.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
      >
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-slate-500">{predio.id}</p>
            <h2 className="mt-1 truncate text-base font-semibold text-slate-950">{predio.nome}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{predio.endereco}</p>
          </div>
          <StatusBadge status={predio.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Quadra</dt>
            <dd className="font-medium text-slate-950">{predio.quadra ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Residências</dt>
            <dd className="font-medium text-slate-950">{predio.quantidadeResidencias}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Recepção</dt>
            <dd className="truncate font-medium text-slate-950">{predio.tipoRecepcao ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Responsável</dt>
            <dd className="truncate font-medium text-slate-950">{predio.responsavel ?? "-"}</dd>
          </div>
        </dl>
      </Link>
    </WithContext>
  );
}

export function PredioTableRow({ predio, periodos }: { predio: PredioResumo; periodos: PeriodoDesignacaoOpcao[] }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <tr
      className="hover:bg-slate-50"
      onContextMenu={(event) => {
        event.preventDefault();
        setPosition({ x: event.clientX, y: event.clientY });
      }}
    >
      <td className="px-4 py-3 font-medium">
        <Link href={`/predios/${predio.id}`} className="text-slate-950 underline-offset-4 hover:underline">
          {predio.id}
        </Link>
        <ContextMenu predio={predio} periodos={periodos} position={position} onClose={() => setPosition(null)} />
      </td>
      <td className="px-4 py-3">{predio.nome}</td>
      <td className="px-4 py-3">{predio.endereco}</td>
      <td className="px-4 py-3">{predio.quadra ?? "-"}</td>
      <td className="px-4 py-3">{predio.quantidadeResidencias}</td>
      <td className="px-4 py-3">{predio.tipoRecepcao ?? "-"}</td>
      <td className="px-4 py-3">{predio.responsavel ?? "-"}</td>
      <td className="px-4 py-3">
        <StatusBadge status={predio.status} />
      </td>
    </tr>
  );
}
