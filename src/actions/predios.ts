"use server";

import { StatusPredioVila } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { designacaoSchema, predioVilaSchema } from "@/lib/validations";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function statusFromResponsavel(responsavel?: string | null, fallback?: StatusPredioVila) {
  if (fallback && fallback !== StatusPredioVila.PENDENTE) return fallback;
  return responsavel ? StatusPredioVila.DESIGNADO : StatusPredioVila.PENDENTE;
}

export async function criarPredioVila(formData: FormData) {
  const parsed = predioVilaSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/predios/novo?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  const data = parsed.data;
  await prisma.predioVila.create({
    data: {
      ...data,
      status: statusFromResponsavel(data.responsavel, data.status),
    },
  });

  revalidatePath("/");
  revalidatePath("/predios");
  redirect(`/predios/${data.id}?success=${encodeURIComponent("Registro criado com sucesso.")}`);
}

export async function atualizarPredioVila(id: string, formData: FormData) {
  const parsed = predioVilaSchema.safeParse({ ...formDataToObject(formData), id });
  if (!parsed.success) {
    redirect(`/predios/${id}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  const data = parsed.data;
  await prisma.predioVila.update({
    where: { id },
    data: {
      ...data,
      status: statusFromResponsavel(data.responsavel, data.status),
    },
  });

  revalidatePath("/");
  revalidatePath("/predios");
  revalidatePath(`/predios/${id}`);
  redirect(`/predios/${id}?success=${encodeURIComponent("Registro atualizado com sucesso.")}`);
}

export async function excluirPredioVila(id: string) {
  await prisma.predioVila.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/predios");
  redirect(`/predios?success=${encodeURIComponent("Registro excluído com sucesso.")}`);
}

export async function designarPredioVila(formData: FormData) {
  const parsed = designacaoSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/designacoes?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  }

  const data = parsed.data;
  await prisma.predioVila.update({
    where: { id: data.id },
    data: {
      responsavel: data.responsavel,
      dataDesignacao: data.dataDesignacao,
      status: StatusPredioVila.DESIGNADO,
    },
  });

  revalidatePath("/");
  revalidatePath("/predios");
  revalidatePath("/designacoes");
  redirect(`/designacoes?success=${encodeURIComponent("Designação salva com sucesso.")}`);
}
