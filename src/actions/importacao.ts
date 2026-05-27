"use server";

import { prisma } from "@/lib/prisma";
import { parseCampanhaWorkbook } from "@/lib/xlsx-import";
import type { ImportReport } from "@/types";

export async function importarCampanha(formData: FormData): Promise<ImportReport> {
  const file = formData.get("arquivo");
  const report: ImportReport = {
    totalLido: 0,
    totalCriado: 0,
    totalAtualizado: 0,
    totalComErro: 0,
    erros: [],
  };

  if (!(file instanceof File) || file.size === 0) {
    return {
      ...report,
      totalComErro: 1,
      erros: [{ linha: 0, mensagem: "Selecione um arquivo .xlsx para importar." }],
    };
  }

  const parsedRows = parseCampanhaWorkbook(await file.arrayBuffer());
  report.totalLido = parsedRows.filter((row) => row.linha > 0).length;

  for (const row of parsedRows) {
    if (!row.data) {
      report.totalComErro += 1;
      report.erros.push({ linha: row.linha, mensagem: row.error ?? "Linha inválida." });
      continue;
    }

    try {
      const exists = await prisma.predioVila.findUnique({
        where: { id: row.data.id },
        select: { id: true },
      });

      await prisma.predioVila.upsert({
        where: { id: row.data.id },
        create: row.data,
        update: row.data,
      });

      if (exists) {
        report.totalAtualizado += 1;
      } else {
        report.totalCriado += 1;
      }
    } catch (error) {
      report.totalComErro += 1;
      report.erros.push({
        linha: row.linha,
        id: row.data.id,
        mensagem: error instanceof Error ? error.message : "Erro ao salvar registro.",
      });
    }
  }

  return report;
}
