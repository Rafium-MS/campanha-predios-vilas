"use server";

import { StatusDesignacao, StatusPeriodoTrabalho, StatusPredioVila, TipoPeriodoTrabalho } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { addMonths, formatDate, verificarBloqueioSemestral } from "@/lib/trabalho";
import {
  concluirDesignacaoSchema,
  criarDesignacaoPeriodoSchema,
  periodoTrabalhoSchema,
  atualizarStatusDesignacaoSchema,
} from "@/lib/validations";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function redirectPeriodo(id: string, params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/periodos/${id}?${query.toString()}`);
}

function periodoData(data: ReturnType<typeof periodoTrabalhoSchema.parse>) {
  return {
    nome: data.nome,
    tipo: data.tipo,
    dataInicio: data.dataInicio as Date,
    dataFim: data.dataFim,
    status: data.status,
    observacoes: data.observacoes,
  };
}

export async function criarPeriodoTrabalho(formData: FormData) {
  const parsed = periodoTrabalhoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/periodos?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  const periodo = await prisma.periodoTrabalho.create({ data: periodoData(parsed.data) });
  revalidatePath("/");
  revalidatePath("/periodos");
  redirect(`/periodos/${periodo.id}?success=${encodeURIComponent("Período criado com sucesso.")}`);
}

export async function atualizarPeriodoTrabalho(id: string, formData: FormData) {
  const parsed = periodoTrabalhoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/periodos/${id}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  await prisma.periodoTrabalho.update({ where: { id }, data: periodoData(parsed.data) });
  revalidatePath("/");
  revalidatePath("/periodos");
  revalidatePath(`/periodos/${id}`);
  redirectPeriodo(id, { success: "Período atualizado com sucesso." });
}

export async function encerrarPeriodoTrabalho(id: string) {
  await prisma.periodoTrabalho.update({
    where: { id },
    data: { status: StatusPeriodoTrabalho.ENCERRADO },
  });

  revalidatePath("/");
  revalidatePath("/periodos");
  revalidatePath(`/periodos/${id}`);
  redirectPeriodo(id, { success: "Período encerrado com sucesso." });
}

export async function criarDesignacaoPeriodo(formData: FormData) {
  const parsed = criarDesignacaoPeriodoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirectPeriodo(String(formData.get("periodoTrabalhoId") ?? ""), {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    });
  }

  const data = parsed.data;
  const dataInicio = data.dataInicio as Date;
  const periodo = await prisma.periodoTrabalho.findUnique({ where: { id: data.periodoTrabalhoId } });
  if (!periodo) redirect("/periodos?error=Período não encontrado.");

  if (periodo.tipo === TipoPeriodoTrabalho.CAMPANHA && periodo.dataFim && dataInicio > periodo.dataFim) {
    redirectPeriodo(periodo.id, { error: "A data de início da designação está fora do período da campanha." });
  }

  if (periodo.tipo === TipoPeriodoTrabalho.SEMESTRAL) {
    const bloqueio = await verificarBloqueioSemestral(data.predioVilaId, dataInicio);
    if (bloqueio.bloqueado) {
      redirectPeriodo(periodo.id, {
        error: `Este prédio/vila está bloqueado por prazo. Próxima data permitida: ${formatDate(
          bloqueio.proximaDataPermitida,
        )}.`,
      });
    }
  }

  const dataFimPrevista =
    periodo.tipo === TipoPeriodoTrabalho.SEMESTRAL ? addMonths(dataInicio, 6) : periodo.dataFim ?? undefined;

  await prisma.$transaction([
    prisma.designacao.create({
      data: {
        predioVilaId: data.predioVilaId,
        periodoTrabalhoId: data.periodoTrabalhoId,
        responsavel: data.responsavel,
        dataDesignacao: dataInicio,
        dataInicio,
        dataFimPrevista,
        status: StatusDesignacao.DESIGNADO,
      },
    }),
    prisma.predioVila.update({
      where: { id: data.predioVilaId },
      data: {
        responsavel: data.responsavel,
        dataDesignacao: dataInicio,
        status: StatusPredioVila.DESIGNADO,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/periodos");
  revalidatePath(`/periodos/${periodo.id}`);
  redirectPeriodo(periodo.id, { success: "Designação criada com sucesso." });
}

export async function atualizarStatusDesignacao(formData: FormData) {
  const parsed = atualizarStatusDesignacaoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) redirect("/periodos?error=Dados inválidos.");

  const designacao = await prisma.designacao.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    select: { periodoTrabalhoId: true },
  });

  revalidatePath("/");
  revalidatePath(`/periodos/${designacao.periodoTrabalhoId}`);
  redirectPeriodo(designacao.periodoTrabalhoId, { success: "Status atualizado com sucesso." });
}

export async function concluirDesignacaoPeriodo(formData: FormData) {
  const parsed = concluirDesignacaoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/periodos?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  const designacao = await prisma.designacao.update({
    where: { id: parsed.data.id },
    data: {
      quantidadeCartasDeixadas: parsed.data.quantidadeCartasDeixadas,
      observacoesDoDesignado: parsed.data.observacoesDoDesignado,
      problemasEncontrados: parsed.data.problemasEncontrados,
      dataConclusao: new Date(),
      status: StatusDesignacao.CONCLUIDO,
    },
    include: { predioVila: true },
  });

  await prisma.predioVila.update({
    where: { id: designacao.predioVilaId },
    data: { status: StatusPredioVila.CONCLUIDO },
  });

  revalidatePath("/");
  revalidatePath("/relatorios");
  revalidatePath(`/periodos/${designacao.periodoTrabalhoId}`);
  redirectPeriodo(designacao.periodoTrabalhoId, { success: "Designação concluída com sucesso." });
}
