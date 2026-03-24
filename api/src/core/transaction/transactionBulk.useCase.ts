import { parse } from "csv-parse/sync";
import { uuidv7 } from "uuidv7";
import type {
  BulkTransactionCommitRequest,
  BulkTransactionPreviewResponse,
} from "../../schemas.js";

import { db } from "../../db/database.js";
import { AccessDeniedException, NotFoundException } from "../../errors.js";
import { getAccountsByUser } from "../account/account.repository.js";
import { generateBulkTransactionPreviewChunk } from "./transactionBulk.openai.js";

const MAX_PREVIEW_FILE_BYTES = 1024 * 1024;
const MAX_PREVIEW_ROWS = 500;
const PREVIEW_CHUNK_SIZE = 100;

const budgetMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

type ParsedCsvRow = {
  rowIndex: number;
  source: Record<string, string>;
};

type BudgetItemCandidate = {
  id: string;
  categoryName: string;
  categoryGroup: string;
  budgetMonth: number;
  budgetYear: number;
  label: string;
};

class BulkPreviewValidationError extends Error {}
class BulkPreviewTooLargeError extends Error {}

const chunk = <T>(items: T[], size: number) => {
  const groups: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
};

const normalizeLookupValue = (value: string | null | undefined) => {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

const dedupeMessages = (messages: string[]) => {
  return Array.from(
    new Set(messages.map((message) => message.trim()).filter(Boolean)),
  );
};

const findRowValue = (source: Record<string, string>, terms: string[]) => {
  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = normalizeLookupValue(key);

    if (terms.some((term) => normalizedKey.includes(term))) {
      return value;
    }
  }

  return null;
};

const guessMerchant = (source: Record<string, string>) => {
  return (
    findRowValue(source, [
      "merchant",
      "description",
      "payee",
      "name",
      "memo",
    ]) ??
    Object.values(source).find((value) => value.trim().length > 0) ??
    null
  );
};

const guessNotes = (source: Record<string, string>) => {
  return findRowValue(source, ["memo", "note", "notes", "details"]) ?? "";
};

const guessAmountAndType = (source: Record<string, string>) => {
  const debitValue = findRowValue(source, ["debit", "withdrawal", "outflow"]);
  const creditValue = findRowValue(source, ["credit", "deposit", "inflow"]);
  const amountValue =
    findRowValue(source, ["amount", "value", "transaction amount"]) ??
    debitValue ??
    creditValue;

  const parseNumeric = (value: string | null) => {
    if (!value) {
      return null;
    }

    const cleanedValue = value.replace(/[$,]/g, "").trim();
    const numericValue = Number(cleanedValue);

    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const debitAmount = parseNumeric(debitValue);
  if (debitAmount !== null) {
    return {
      amount: Math.abs(debitAmount),
      type: "debit" as const,
    };
  }

  const creditAmount = parseNumeric(creditValue);
  if (creditAmount !== null) {
    return {
      amount: Math.abs(creditAmount),
      type: "credit" as const,
    };
  }

  const amount = parseNumeric(amountValue);
  if (amount === null) {
    return {
      amount: null,
      type: null,
    };
  }

  return {
    amount: Math.abs(amount),
    type: amount < 0 ? ("debit" as const) : ("credit" as const),
  };
};

const guessDate = (source: Record<string, string>) => {
  return (
    findRowValue(source, ["date", "posted", "transaction date", "effective"]) ??
    null
  );
};

const parsePreviewDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const buildBudgetItemCandidates = async (
  userId: string,
): Promise<BudgetItemCandidate[]> => {
  const rows = await db
    .selectFrom("budgetItems")
    .innerJoin("budgets", "budgets.id", "budgetItems.budgetId")
    .innerJoin("categories", "categories.id", "budgetItems.categoryId")
    .select([
      "budgetItems.id as id",
      "categories.name as categoryName",
      "categories.group as categoryGroup",
      "budgets.month as budgetMonth",
      "budgets.year as budgetYear",
    ])
    .where("budgets.userId", "=", userId)
    .execute();

  return rows.map((row) => ({
    ...row,
    label: `${row.categoryName} · ${row.categoryGroup} · ${budgetMonthFormatter.format(
      new Date(row.budgetYear, row.budgetMonth - 1, 1),
    )}`,
  }));
};

const parseCsvRows = async (file: File): Promise<ParsedCsvRow[]> => {
  if (file.size === 0) {
    throw new BulkPreviewValidationError("The uploaded CSV file is empty.");
  }

  if (file.size > MAX_PREVIEW_FILE_BYTES) {
    throw new BulkPreviewTooLargeError(
      "CSV file exceeds the 1 MB preview limit.",
    );
  }

  const fileText = await file.text();
  if (!fileText.trim()) {
    throw new BulkPreviewValidationError("The uploaded CSV file is empty.");
  }

  const parsedRows = parse(fileText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Array<Record<string, unknown>>;

  if (parsedRows.length === 0) {
    throw new BulkPreviewValidationError(
      "The uploaded CSV does not contain any rows.",
    );
  }

  if (parsedRows.length > MAX_PREVIEW_ROWS) {
    throw new BulkPreviewTooLargeError("CSV preview supports up to 500 rows.");
  }

  return parsedRows.map((row, index) => ({
    rowIndex: index + 1,
    source: Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, String(value ?? "")]),
    ),
  }));
};

const resolveAccount = (
  accountName: string | null,
  accounts: Array<{ id: string; name: string }>,
) => {
  if (!accountName) {
    return null;
  }

  const exactMatch = accounts.find((account) => account.name === accountName);
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedName = normalizeLookupValue(accountName);
  const normalizedMatches = accounts.filter(
    (account) => normalizeLookupValue(account.name) === normalizedName,
  );

  return normalizedMatches.length === 1 ? normalizedMatches[0] : null;
};

const resolveBudgetItem = (
  candidate: {
    categoryName: string | null;
    categoryGroup: string | null;
    budgetMonth: number | null;
    budgetYear: number | null;
  },
  budgetItems: BudgetItemCandidate[],
) => {
  if (
    !candidate.categoryName ||
    !candidate.categoryGroup ||
    candidate.budgetMonth === null ||
    candidate.budgetYear === null
  ) {
    return null;
  }

  const categoryName = normalizeLookupValue(candidate.categoryName);
  const categoryGroup = normalizeLookupValue(candidate.categoryGroup);

  const exactMatches = budgetItems.filter((budgetItem) => {
    return (
      normalizeLookupValue(budgetItem.categoryName) === categoryName &&
      normalizeLookupValue(budgetItem.categoryGroup) === categoryGroup &&
      budgetItem.budgetMonth === candidate.budgetMonth &&
      budgetItem.budgetYear === candidate.budgetYear
    );
  });

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  const categoryMatches = budgetItems.filter((budgetItem) => {
    return (
      normalizeLookupValue(budgetItem.categoryName) === categoryName &&
      normalizeLookupValue(budgetItem.categoryGroup) === categoryGroup
    );
  });

  return categoryMatches.length === 1 ? categoryMatches[0] : null;
};

const normalizePreviewChunkRows = ({
  accounts,
  budgetItems,
  chunkRows,
  modelRows,
}: {
  accounts: Array<{ id: string; name: string }>;
  budgetItems: BudgetItemCandidate[];
  chunkRows: ParsedCsvRow[];
  modelRows: Awaited<
    ReturnType<typeof generateBulkTransactionPreviewChunk>
  >["rows"];
}): BulkTransactionPreviewResponse["rows"] => {
  const modelRowByIndex = new Map(
    modelRows.map((row) => [row.rowIndex, row] as const),
  );

  return chunkRows.map((chunkRow) => {
    const modelRow = modelRowByIndex.get(chunkRow.rowIndex);
    const warnings = [...(modelRow?.warnings ?? [])];
    const errors: string[] = [];
    const fallbackAmount = guessAmountAndType(chunkRow.source);
    const parsedDate =
      parsePreviewDate(modelRow?.date) ??
      parsePreviewDate(guessDate(chunkRow.source));

    const merchant =
      modelRow?.merchant?.trim() ||
      guessMerchant(chunkRow.source) ||
      `Row ${chunkRow.rowIndex}`;
    const amount = modelRow?.amount ?? fallbackAmount.amount ?? 0;
    const type = modelRow?.type ?? fallbackAmount.type ?? "debit";
    const notes = modelRow?.notes?.trim() ?? guessNotes(chunkRow.source);

    if (!parsedDate) {
      errors.push("Unable to determine a valid transaction date.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Unable to determine a valid positive amount.");
    }

    const resolvedAccount = resolveAccount(
      modelRow?.accountName ?? null,
      accounts,
    );
    if (modelRow?.accountName && !resolvedAccount) {
      warnings.push(`Could not match account "${modelRow.accountName}".`);
    }
    if (!modelRow?.accountName) {
      warnings.push("No account suggestion was returned.");
    }

    const resolvedBudgetItem = resolveBudgetItem(
      {
        categoryName: modelRow?.categoryName ?? null,
        categoryGroup: modelRow?.categoryGroup ?? null,
        budgetMonth: modelRow?.budgetMonth ?? null,
        budgetYear: modelRow?.budgetYear ?? null,
      },
      budgetItems,
    );
    if (
      modelRow?.categoryName ||
      modelRow?.categoryGroup ||
      modelRow?.budgetMonth !== null ||
      modelRow?.budgetYear !== null
    ) {
      if (!resolvedBudgetItem) {
        warnings.push("Could not match the suggested budget line.");
      }
    } else {
      warnings.push("No budget line suggestion was returned.");
    }

    if (!modelRow) {
      errors.push("OpenAI did not return a preview row for this CSV row.");
    }

    return {
      id: uuidv7(),
      merchant,
      amount: Math.abs(amount || 0),
      notes,
      date: parsedDate ?? new Date(),
      type,
      accountId: resolvedAccount?.id ?? null,
      accountName: resolvedAccount?.name ?? modelRow?.accountName ?? null,
      budgetItemId: resolvedBudgetItem?.id ?? null,
      warnings: dedupeMessages(warnings),
      errors: dedupeMessages(errors),
    };
  });
};

const validateCommittedReferences = async (
  userId: string,
  request: BulkTransactionCommitRequest,
) => {
  const accountIds = Array.from(
    new Set(request.rows.map((row) => row.accountId)),
  );
  const budgetItemIds = Array.from(
    new Set(request.rows.map((row) => row.budgetItemId)),
  );

  const [allAccounts, allBudgetItems, existingAccounts, existingBudgetItems] =
    await Promise.all([
      db
        .selectFrom("accounts")
        .select(["accounts.id as id"])
        .where("accounts.userId", "=", userId)
        .where("accounts.id", "in", accountIds)
        .execute(),
      db
        .selectFrom("budgetItems")
        .innerJoin("budgets", "budgets.id", "budgetItems.budgetId")
        .select(["budgetItems.id as id"])
        .where("budgets.userId", "=", userId)
        .where("budgetItems.id", "in", budgetItemIds)
        .execute(),
      db
        .selectFrom("accounts")
        .select(["accounts.id as id"])
        .where("accounts.id", "in", accountIds)
        .execute(),
      db
        .selectFrom("budgetItems")
        .select(["budgetItems.id as id"])
        .where("budgetItems.id", "in", budgetItemIds)
        .execute(),
    ]);

  const accountById = new Map(
    allAccounts.map((account) => [account.id, account]),
  );
  const budgetItemById = new Map(
    allBudgetItems.map((budgetItem) => [budgetItem.id, budgetItem]),
  );
  const existingAccountIds = new Set(
    existingAccounts.map((account) => account.id),
  );
  const existingBudgetItemIds = new Set(
    existingBudgetItems.map((budgetItem) => budgetItem.id),
  );

  for (const accountId of accountIds) {
    if (accountById.has(accountId)) {
      continue;
    }

    if (existingAccountIds.has(accountId)) {
      throw new AccessDeniedException("Account ownership mismatch");
    }

    throw new NotFoundException("Referenced resource not found");
  }

  for (const budgetItemId of budgetItemIds) {
    if (budgetItemById.has(budgetItemId)) {
      continue;
    }

    if (existingBudgetItemIds.has(budgetItemId)) {
      throw new AccessDeniedException("Budget item ownership mismatch");
    }

    throw new NotFoundException("Referenced resource not found");
  }
};

export const createBulkTransactionPreview = async (
  userId: string,
  file: File,
): Promise<BulkTransactionPreviewResponse> => {
  const parsedCsvRows = await parseCsvRows(file);
  const previewId = uuidv7();

  const [accounts, budgetItems] = await Promise.all([
    getAccountsByUser(userId),
    buildBudgetItemCandidates(userId),
  ]);

  const previewRows: BulkTransactionPreviewResponse["rows"] = [];

  for (const rowChunk of chunk(parsedCsvRows, PREVIEW_CHUNK_SIZE)) {
    const modelChunk = await generateBulkTransactionPreviewChunk({
      previewId,
      rows: rowChunk,
      accounts: accounts.map((account) => ({
        name: account.name,
        type: account.type,
      })),
      budgetItems: budgetItems.map((budgetItem) => ({
        categoryName: budgetItem.categoryName,
        categoryGroup: budgetItem.categoryGroup,
        budgetMonth: budgetItem.budgetMonth,
        budgetYear: budgetItem.budgetYear,
        label: budgetItem.label,
      })),
    });

    previewRows.push(
      ...normalizePreviewChunkRows({
        chunkRows: rowChunk,
        accounts,
        budgetItems,
        modelRows: modelChunk.rows,
      }),
    );
  }

  return {
    previewId,
    rows: previewRows,
  };
};

export const commitBulkTransactions = async (
  userId: string,
  request: BulkTransactionCommitRequest,
) => {
  await validateCommittedReferences(userId, request);

  const committedRows = request.rows.map((row) => {
    const parsedDate = new Date(row.date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BulkPreviewValidationError(
        "Bulk commit contains an invalid date.",
      );
    }

    return {
      ...row,
      date: parsedDate,
    };
  });

  const signedImpactByBudgetItemId = new Map<string, number>();
  for (const row of committedRows) {
    const signedAmount = row.type === "credit" ? -row.amount : row.amount;
    const currentAmount = signedImpactByBudgetItemId.get(row.budgetItemId) ?? 0;

    signedImpactByBudgetItemId.set(
      row.budgetItemId,
      currentAmount + signedAmount,
    );
  }

  await db.transaction().execute(async (trx) => {
    const now = new Date().toISOString();
    await trx
      .insertInto("transactions")
      .values(
        committedRows.map((row) => ({
          id: uuidv7(),
          merchant: row.merchant,
          amount: row.amount,
          notes: row.notes,
          date: row.date.toISOString(),
          type: row.type,
          userId,
          accountId: row.accountId,
          budgetItemId: row.budgetItemId,
          recurringTemplateId: row.recurringTemplateId ?? null,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .execute();

    const currentBudgetItems = await trx
      .selectFrom("budgetItems")
      .innerJoin("budgets", "budgets.id", "budgetItems.budgetId")
      .select([
        "budgetItems.id as id",
        "budgetItems.actualAmount as actualAmount",
      ])
      .where("budgets.userId", "=", userId)
      .where(
        "budgetItems.id",
        "in",
        Array.from(signedImpactByBudgetItemId.keys()),
      )
      .execute();

    for (const budgetItem of currentBudgetItems) {
      const delta = signedImpactByBudgetItemId.get(budgetItem.id) ?? 0;

      await trx
        .updateTable("budgetItems")
        .set({
          actualAmount: budgetItem.actualAmount + delta,
          updatedAt: new Date(),
        })
        .where("id", "=", budgetItem.id)
        .where(({ exists, selectFrom }) =>
          exists(
            selectFrom("budgets")
              .select("budgets.id")
              .whereRef("budgets.id", "=", "budgetItems.budgetId")
              .where("budgets.userId", "=", userId),
          ),
        )
        .execute();
    }
  });

  return {
    createdCount: committedRows.length,
    affectedBudgetItemCount: signedImpactByBudgetItemId.size,
    previewId: request.previewId ?? null,
  };
};

export { BulkPreviewTooLargeError, BulkPreviewValidationError };
