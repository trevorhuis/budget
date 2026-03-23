import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { env, getOpenAiApiKey } from "../../env.js";

export type BulkPreviewAccountCandidate = {
  name: string;
  type: "savings" | "checking" | "creditCard";
};

export type BulkPreviewBudgetItemCandidate = {
  categoryName: string;
  categoryGroup: string;
  budgetMonth: number;
  budgetYear: number;
  label: string;
};

export type BulkPreviewInputRow = {
  rowIndex: number;
  source: Record<string, string>;
};

const BulkPreviewModelRowSchema = z.object({
  rowIndex: z.number().int().positive(),
  merchant: z.string().nullable(),
  amount: z.number().nullable(),
  notes: z.string().nullable(),
  date: z.string().nullable(),
  type: z.enum(["credit", "debit"]).nullable(),
  accountName: z.string().nullable(),
  categoryName: z.string().nullable(),
  categoryGroup: z.string().nullable(),
  budgetMonth: z.number().int().min(1).max(12).nullable(),
  budgetYear: z.number().int().min(2000).max(2100).nullable(),
  warnings: z.array(z.string()).default([]),
});

const BulkPreviewModelChunkSchema = z.object({
  rows: z.array(BulkPreviewModelRowSchema),
});

type BulkPreviewModelChunk = z.infer<typeof BulkPreviewModelChunkSchema>;

type BulkPreviewExecutorArgs = {
  instructions: string;
  input: string;
  model: string;
};

type BulkPreviewExecutor = (
  args: BulkPreviewExecutorArgs,
) => Promise<unknown>;

let previewExecutorOverride: BulkPreviewExecutor | null = null;

export const setBulkTransactionPreviewExecutorForTests = (
  executor: BulkPreviewExecutor | null,
) => {
  previewExecutorOverride = executor;
};

const getPreviewModel = () => {
  return env.OPENAI_BULK_TRANSACTIONS_MODEL ?? "gpt-5-mini";
};

const buildInstructions = () => {
  return [
    "You convert bank CSV rows into normalized transaction preview rows for a budgeting app.",
    "Return exactly one output row for every input row index.",
    "Never output database IDs.",
    "Normalize merchant names into short readable merchant strings.",
    "Set amount to a positive numeric amount and use type to indicate debit or credit.",
    "Use ISO 8601 dates.",
    "Suggest accountName using only the provided account candidates or null.",
    "Suggest categoryName, categoryGroup, budgetMonth, and budgetYear using only the provided budget line candidates or null.",
    "Put uncertainty or cleanup notes into warnings.",
    "If a field cannot be determined confidently, return null for that field and add a warning.",
  ].join(" ");
};

const defaultPreviewExecutor: BulkPreviewExecutor = async ({
  instructions,
  input,
  model,
}) => {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.parse({
    model,
    instructions,
    input,
    text: {
      format: zodTextFormat(
        BulkPreviewModelChunkSchema,
        "bulk_transaction_preview_chunk",
      ),
    },
  });

  return response.output_parsed;
};

export const generateBulkTransactionPreviewChunk = async ({
  accounts,
  budgetItems,
  previewId,
  rows,
}: {
  accounts: BulkPreviewAccountCandidate[];
  budgetItems: BulkPreviewBudgetItemCandidate[];
  previewId: string;
  rows: BulkPreviewInputRow[];
}): Promise<BulkPreviewModelChunk> => {
  const parsed = await (previewExecutorOverride ?? defaultPreviewExecutor)({
    instructions: buildInstructions(),
    model: getPreviewModel(),
    input: JSON.stringify(
      {
        previewId,
        accounts,
        budgetItems,
        rows,
      },
      null,
      2,
    ),
  });

  return BulkPreviewModelChunkSchema.parse(parsed);
};
