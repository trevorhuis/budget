import {
  ArrowPathRoundedSquareIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useLiveQuery } from "@tanstack/react-db";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { Account, BudgetItem, Category } from "schemas";

import {
  API,
  type BulkTransactionCommitRequest,
  type BulkTransactionPreviewRow,
} from "../lib/api";
import {
  type BulkBudgetItemOption,
  type BulkTransactionDraftRow,
  isBulkTransactionReady,
} from "../lib/bulk-transactions";
import {
  accountCollection,
  budgetCollection,
  budgetItemCollection,
  categoryCollection,
  transactionCollection,
} from "../lib/collections";
import { BulkTransactionReviewTable } from "./BulkTransactionReviewTable";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "./ui/description-list";
import { Field, FieldGroup, Fieldset, Label, Legend } from "./ui/fieldset";
import { Heading, Subheading } from "./ui/heading";
import { Text } from "./ui/text";

const budgetMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

type WorkspaceMode = "idle" | "uploading" | "review" | "submitting";

const getBudgetItemOptions = ({
  budgetItems,
  budgets,
  categories,
}: {
  budgetItems: BudgetItem[];
  budgets: Array<{ id: string; month: number; year: number }>;
  categories: Category[];
}) => {
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const budgetById = new Map(
    budgets.map((budget) => [budget.id, budget] as const),
  );

  return budgetItems
    .map((budgetItem): BulkBudgetItemOption | null => {
      const category = categoryById.get(budgetItem.categoryId);
      const budget = budgetById.get(budgetItem.budgetId);

      if (!category || !budget) {
        return null;
      }

      const budgetLabel = budgetMonthFormatter.format(
        new Date(budget.year, budget.month - 1, 1),
      );

      return {
        id: budgetItem.id,
        categoryName: category.name,
        groupName: category.group,
        budgetLabel,
        budgetMonth: budget.month,
        budgetYear: budget.year,
        label: `${category.name} · ${category.group} · ${budgetLabel}`,
      };
    })
    .filter((option): option is BulkBudgetItemOption => option !== null)
    .sort((left, right) => left.label.localeCompare(right.label));
};

const mapPreviewRowToDraft = (
  row: BulkTransactionPreviewRow,
): BulkTransactionDraftRow => ({
  ...row,
  initialBudgetItemId: row.budgetItemId,
  selected: false,
  dirty: false,
});

export function BulkTransactionsWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: accounts = [] } = useLiveQuery((q) =>
    q.from({ account: accountCollection }),
  );
  const { data: budgets = [] } = useLiveQuery((q) =>
    q.from({ budget: budgetCollection }),
  );
  const { data: budgetItems = [] } = useLiveQuery((q) =>
    q.from({ budgetItem: budgetItemCollection }),
  );
  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ category: categoryCollection }),
  );

  const [mode, setMode] = useState<WorkspaceMode>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [rows, setRows] = useState<BulkTransactionDraftRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account] as const)),
    [accounts],
  );

  const budgetItemOptions = useMemo(
    () => getBudgetItemOptions({ budgetItems, budgets, categories }),
    [budgetItems, budgets, categories],
  );

  const readyRows = rows.filter(isBulkTransactionReady).length;
  const invalidRows = rows.length - readyRows;
  const warningRows = rows.filter((row) => row.warnings.length > 0).length;
  const canSubmit = rows.length > 0 && rows.every(isBulkTransactionReady);

  const resetUploadFlow = () => {
    setMode("idle");
    setSelectedFile(null);
    setPreviewId(null);
    setRows([]);
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (file: File | null) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessCount(null);
  };

  const handlePreviewRequest = async () => {
    if (!selectedFile) {
      setErrorMessage("Choose a CSV file before requesting the preview.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Bulk upload currently accepts CSV files only.");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);

    setMode("uploading");
    setErrorMessage(null);

    try {
      const response = await API.transactions.bulkPreview(formData);
      const nextRows = response.data.rows.map((row) => {
        const account = row.accountId ? accountById.get(row.accountId) : null;

        return mapPreviewRowToDraft({
          ...row,
          accountName: row.accountName ?? account?.name ?? null,
        });
      });

      setPreviewId(response.data.previewId);
      setRows(nextRows);
      setMode("review");
    } catch (error) {
      setMode("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate a bulk import preview.",
      );
    }
  };

  const updateRow = (
    rowId: string,
    updater: (row: BulkTransactionDraftRow) => BulkTransactionDraftRow,
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? updater(row) : row)),
    );
  };

  const handleBudgetItemChange = (
    rowId: string,
    budgetItemId: BudgetItem["id"] | null,
  ) => {
    updateRow(rowId, (row) => ({
      ...row,
      budgetItemId,
      dirty: budgetItemId !== row.initialBudgetItemId,
    }));
  };

  const handleSelectionChange = (rowId: string, selected: boolean) => {
    updateRow(rowId, (row) => ({
      ...row,
      selected,
    }));
  };

  const handleBulkSelectionChange = (rowIds: string[], selected: boolean) => {
    if (rowIds.length === 0) {
      return;
    }

    const rowIdSet = new Set(rowIds);

    setRows((currentRows) =>
      currentRows.map((row) =>
        rowIdSet.has(row.id)
          ? {
              ...row,
              selected,
            }
          : row,
      ),
    );
  };

  const handleBatchBudgetItemApply = (
    rowIds: string[],
    budgetItemId: BudgetItem["id"],
  ) => {
    const rowIdSet = new Set(rowIds);

    setRows((currentRows) =>
      currentRows.map((row) =>
        rowIdSet.has(row.id)
          ? {
              ...row,
              budgetItemId,
              dirty: budgetItemId !== row.initialBudgetItemId,
            }
          : row,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setErrorMessage(
        "Resolve every missing assignment or blocking import error before uploading.",
      );
      return;
    }

    setMode("submitting");
    setErrorMessage(null);

    const payload: BulkTransactionCommitRequest = {
      previewId,
      rows: rows.map((row) => ({
        previewRowId: row.id,
        merchant: row.merchant,
        amount: row.amount,
        notes: row.notes,
        date: row.date,
        type: row.type,
        accountId: row.accountId as Account["id"],
        budgetItemId: row.budgetItemId as BudgetItem["id"],
        recurringTemplateId: null,
      })),
    };

    try {
      await API.transactions.bulkCreate(payload);
      await Promise.all([
        transactionCollection.utils.refetch(),
        budgetItemCollection.utils.refetch(),
      ]);

      const uploadedCount = rows.length;

      resetUploadFlow();
      setSuccessCount(uploadedCount);
    } catch (error) {
      setMode("review");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the reviewed transactions.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="grid gap-8 border-b border-zinc-950/6 pb-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(22rem,30rem)] dark:border-white/8"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Heading>Bulk transactions</Heading>
            <Text>
              Upload a CSV, let the import preview assign budget lines, then
              review and correct the ledger mapping before anything posts.
            </Text>
          </div>

          <DescriptionList className="max-w-3xl [&>dd]:pb-2.5 [&>dd]:pt-0.5 [&>dt]:pt-2.5 sm:[&>dd]:py-2.5 sm:[&>dt]:py-2.5">
            <DescriptionTerm>Workflow</DescriptionTerm>
            <DescriptionDetails>Upload, review, submit</DescriptionDetails>

            <DescriptionTerm>Review edits</DescriptionTerm>
            <DescriptionDetails>
              Per-row and batch budget-line updates
            </DescriptionDetails>

            <DescriptionTerm>Submit strategy</DescriptionTerm>
            <DescriptionDetails>
              Final API commit, then collection refetch
            </DescriptionDetails>
          </DescriptionList>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Badge color="sky">
                  <ArrowUpTrayIcon className="size-4" />
                  CSV preview
                </Badge>
              </div>
              <Text className="mt-2.5">
                The upload step is review-first. Nothing posts until every row
                is valid and you confirm the final import.
              </Text>
            </div>

            <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Badge color="amber">
                  <ExclamationTriangleIcon className="size-4" />
                  Attention rows
                </Badge>
              </div>
              <Text className="mt-2.5">
                Backend warnings stay visible during review so category cleanup
                can focus on rows with the most import risk.
              </Text>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/4">
          <Fieldset>
            <Legend>Upload a CSV</Legend>
            <Text className="mt-1">
              Start with a bank export or statement CSV. The preview request
              should normalize each row and return suggested budget lines.
            </Text>

            <FieldGroup className="mt-6">
              <Field>
                <Label>CSV file</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  disabled={mode === "uploading" || mode === "submitting"}
                  onChange={(event) =>
                    handleFileSelection(event.target.files?.[0] ?? null)
                  }
                  className="block w-full rounded-lg border border-zinc-950/10 bg-white px-3.5 py-2.5 text-sm text-zinc-950 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:file:bg-white dark:file:text-zinc-950"
                />
              </Field>

              {selectedFile ? (
                <div className="rounded-xl border border-zinc-950/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950/40">
                  <div className="text-sm font-medium text-zinc-950 dark:text-white">
                    {selectedFile.name}
                  </div>
                  <Text className="mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Text>
                </div>
              ) : (
                <Text>Select a CSV file to request the import preview.</Text>
              )}

              {successCount ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircleIcon className="size-5" />
                    <span className="font-medium">
                      Uploaded {successCount} transactions successfully.
                    </span>
                  </div>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
                  <Text className="text-red-700 dark:text-red-300">
                    {errorMessage}
                  </Text>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Text>
                  {mode === "uploading"
                    ? "Requesting the backend preview."
                    : mode === "submitting"
                      ? "Submitting the reviewed transactions."
                      : "Preview first, then upload the reviewed rows in one final request."}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {mode === "review" ? (
                    <Button plain onClick={resetUploadFlow}>
                      Replace file
                    </Button>
                  ) : null}
                  <Button
                    color="dark/zinc"
                    onClick={() => void handlePreviewRequest()}
                    disabled={
                      !selectedFile ||
                      mode === "uploading" ||
                      mode === "submitting"
                    }
                  >
                    <ArrowUpTrayIcon data-slot="icon" />
                    {mode === "uploading" ? "Previewing..." : "Preview import"}
                  </Button>
                </div>
              </div>
            </FieldGroup>
          </Fieldset>
        </div>
      </motion.section>

      {mode === "review" || mode === "submitting" ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-4 border-b border-zinc-950/6 pb-4 dark:border-white/8 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <Subheading>Review imported transactions</Subheading>
              <Text>
                Adjust budget-line assignments in the table, filter for warning
                rows, and only upload once everything is valid.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color={canSubmit ? "emerald" : "amber"}>
                {readyRows} ready
              </Badge>
              <Badge color={warningRows > 0 ? "amber" : "zinc"}>
                {warningRows} warnings
              </Badge>
              <Badge color={invalidRows > 0 ? "red" : "emerald"}>
                {invalidRows} invalid
              </Badge>
            </div>
          </div>

          <BulkTransactionReviewTable
            rows={rows}
            budgetItemOptions={budgetItemOptions}
            onRowSelectionChange={handleSelectionChange}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBudgetItemChange={handleBudgetItemChange}
            onBatchBudgetItemApply={handleBatchBudgetItemApply}
          />

          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="font-medium text-zinc-950 dark:text-white">
                Final upload
              </div>
              <Text>
                Upload uses the reviewed local draft state, not the raw preview
                payload. All rows must be valid first.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button plain href="/transactions">
                <ArrowPathRoundedSquareIcon data-slot="icon" />
                Back to transactions
              </Button>
              <Button plain onClick={resetUploadFlow} disabled={mode === "submitting"}>
                Replace file
              </Button>
              <Button
                color="dark/zinc"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || mode === "submitting"}
              >
                <ArrowUpTrayIcon data-slot="icon" />
                {mode === "submitting" ? "Uploading..." : "Upload all"}
              </Button>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="rounded-2xl border border-dashed border-zinc-950/10 px-6 py-10 dark:border-white/10"
        >
          <Subheading>Review table appears after preview</Subheading>
          <Text className="mt-2">
            Once the CSV preview returns rows, the TanStack Table review surface
            will appear here with inline budget-line editing and batch actions.
          </Text>
        </motion.section>
      )}
    </div>
  );
}
