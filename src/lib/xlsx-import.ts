import { StatusPredioVila } from "@prisma/client";
import * as XLSX from "xlsx";

import { importRowSchema } from "@/lib/validations";

type ParsedRow = {
  linha: number;
  data?: ReturnType<typeof importRowSchema.parse>;
  error?: string;
};

function cellToString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text === "" ? undefined : text;
}

function cellToNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function excelSerialToDate(value: number): Date | undefined {
  const parsed = XLSX.SSF.parse_date_code(value);
  if (!parsed) return undefined;
  return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, parsed.S));
}

function cellToDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "number") return excelSerialToDate(value);
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function parseCampanhaWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets.Campanha;

  if (!sheet) {
    return [{ linha: 0, error: 'A aba "Campanha" não foi encontrada.' }];
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: undefined,
  });

  return rows.slice(2).map((row, index) => {
    const linha = index + 3;
    const id = cellToString(row[0]);
    const responsavel = cellToString(row[8]);

    const raw = {
      id,
      nome: cellToString(row[1]),
      endereco: cellToString(row[2]),
      tipo: cellToString(row[3]),
      numero: cellToString(row[4]),
      quantidadeResidencias: cellToNumber(row[5]) ?? 0,
      modalidade: cellToString(row[6]),
      tipoRecepcao: cellToString(row[7]),
      responsavel,
      dataDesignacao: cellToDate(row[9]),
      quadra: cellToNumber(row[10]),
      observacoes: cellToString(row[11]),
      status: responsavel ? StatusPredioVila.DESIGNADO : StatusPredioVila.PENDENTE,
    };

    const parsed = importRowSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        linha,
        error: parsed.error.issues.map((issue) => issue.message).join("; "),
      };
    }

    return { linha, data: parsed.data };
  });
}
