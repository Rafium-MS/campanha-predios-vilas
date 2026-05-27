import { prisma } from "@/lib/prisma";

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const registros = await prisma.predioVila.findMany({
    orderBy: [{ quadra: "asc" }, { nome: "asc" }],
  });

  const headers = [
    "ID",
    "NOME",
    "ENDERECO",
    "TIPO",
    "NUMERO",
    "QUANTIDADE_RESIDENCIAS",
    "MODALIDADE",
    "TIPO_RECEPCAO",
    "RESPONSAVEL",
    "DATA_DESIGNACAO",
    "QUADRA",
    "OBSERVACOES",
    "STATUS",
  ];

  const lines = [
    headers.join(","),
    ...registros.map((item) =>
      [
        item.id,
        item.nome,
        item.endereco,
        item.tipo,
        item.numero,
        item.quantidadeResidencias,
        item.modalidade,
        item.tipoRecepcao,
        item.responsavel,
        item.dataDesignacao,
        item.quadra,
        item.observacoes,
        item.status,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="campanha-predios-vilas.csv"',
    },
  });
}
