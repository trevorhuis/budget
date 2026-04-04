/* eslint-disable react-refresh/only-export-components */

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { AccountSetupStep } from "~/components/onboarding/account-setup-step";
import { BudgetSetupStep } from "~/components/onboarding/budget-setup-step";
import { OnboardingShell } from "~/components/onboarding/onboarding-shell";
import { OnboardingSidebarSummary } from "~/components/onboarding/onboarding-sidebar-summary";
import { RecurringSetupStep } from "~/components/onboarding/recurring-setup-step";
import { resolveAuthSession } from "~/lib/auth";
import { categoryCollection } from "~/lib/collections/categoryCollection";
import {
  completeOnboarding,
  createAccountDraft,
  createBudgetItemDraft,
  createCustomBudgetItemDraft,
  createRecurringDraft,
  getBudgetItemCategoryKey,
  getNeedsOnboarding,
  onboardingAccountStarters,
  onboardingBudgetPacks,
  onboardingCoreBudgetItems,
  type OnboardingAccountDraft,
  type OnboardingBudgetItemDraft,
  type OnboardingRecurringDraft,
} from "~/lib/onboarding";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ context, location }) => {
    const session = await resolveAuthSession(context.auth);

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const needsOnboarding = await getNeedsOnboarding();

    if (!needsOnboarding) {
      throw redirect({ to: "/budget" });
    }
  },
  component: OnboardingPage,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const parseAmount = (value: string) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const normalizeBudgetGroup = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

const getCanonicalGroupName = (
  items: OnboardingBudgetItemDraft[],
  groupName: string,
) => {
  const normalizedGroup = normalizeBudgetGroup(groupName).toLowerCase();

  if (!normalizedGroup) {
    return "";
  }

  const existingGroup = items.find(
    (item) => normalizeBudgetGroup(item.group).toLowerCase() === normalizedGroup,
  );

  return existingGroup
    ? normalizeBudgetGroup(existingGroup.group)
    : normalizeBudgetGroup(groupName);
};

const getNextCustomLineName = (
  items: OnboardingBudgetItemDraft[],
  groupName: string,
) => {
  const normalizedGroup = normalizeBudgetGroup(groupName).toLowerCase();
  const existingNames = new Set(
    items
      .filter(
        (item) =>
          normalizeBudgetGroup(item.group).toLowerCase() === normalizedGroup,
      )
      .map((item) => item.name.trim().toLowerCase()),
  );

  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? "New line" : `New line ${suffix}`;

    if (!existingNames.has(candidate.toLowerCase())) {
      return candidate;
    }

    suffix += 1;
  }
};

const updateBudgetItemDraft = (
  item: OnboardingBudgetItemDraft,
  field: "name" | "group" | "targetAmount" | "enabled",
  value: string | boolean,
): OnboardingBudgetItemDraft => {
  switch (field) {
    case "enabled":
      return { ...item, enabled: Boolean(value) };
    case "name":
      return { ...item, name: String(value) };
    case "group":
      return { ...item, group: String(value) };
    case "targetAmount":
      return { ...item, targetAmount: String(value) };
  }
};

const updateAccountDraft = (
  account: OnboardingAccountDraft,
  field: "name" | "type" | "balance",
  value: string,
): OnboardingAccountDraft => {
  switch (field) {
    case "name":
      return { ...account, name: value };
    case "type":
      return {
        ...account,
        type: value as OnboardingAccountDraft["type"],
      };
    case "balance":
      return { ...account, balance: value };
  }
};

const updateRecurringDraft = (
  transaction: OnboardingRecurringDraft,
  field: "merchant" | "amount" | "recurringDate" | "categoryKey" | "notes",
  value: string,
): OnboardingRecurringDraft => {
  switch (field) {
    case "merchant":
      return { ...transaction, merchant: value };
    case "amount":
      return { ...transaction, amount: value };
    case "recurringDate":
      return { ...transaction, recurringDate: value };
    case "categoryKey":
      return { ...transaction, categoryKey: value };
    case "notes":
      return { ...transaction, notes: value };
  }
};

const getUniqueCategoryItems = (items: OnboardingBudgetItemDraft[]) => {
  const uniqueItems = new Map<string, OnboardingBudgetItemDraft>();

  for (const item of items) {
    uniqueItems.set(getBudgetItemCategoryKey(item), item);
  }

  return Array.from(uniqueItems.values());
};

function OnboardingPage() {
  const navigate = useNavigate();
  const categoryQuery = useLiveQuery((q) =>
    q.from({ categories: categoryCollection }),
  );

  const existingCategories = categoryQuery.data ?? [];
  const areCategoriesReady = categoryQuery.data !== undefined;

  const [step, setStep] = useState(1);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [coreItems, setCoreItems] = useState<OnboardingBudgetItemDraft[]>(() =>
    onboardingCoreBudgetItems.map(createBudgetItemDraft),
  );
  const [packItems, setPackItems] = useState<
    Record<string, OnboardingBudgetItemDraft[]>
  >(() =>
    Object.fromEntries(
      onboardingBudgetPacks.map((pack) => [
        pack.id,
        pack.items.map(createBudgetItemDraft),
      ]),
    ),
  );
  const [customItems, setCustomItems] = useState<OnboardingBudgetItemDraft[]>(
    [],
  );
  const [accounts, setAccounts] = useState<OnboardingAccountDraft[]>(() => [
    createAccountDraft(),
  ]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    OnboardingRecurringDraft[]
  >([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const launchDate = new Date();
  const launchMonthLabel = monthFormatter.format(launchDate);
  const launchMonth = launchDate.getMonth() + 1;
  const launchYear = launchDate.getFullYear();

  const visibleBudgetItems = [
    ...coreItems,
    ...selectedPackIds.flatMap((packId) => packItems[packId] ?? []),
    ...customItems,
  ];

  const selectedBudgetItems = visibleBudgetItems.filter((item) => item.enabled);
  const uniqueSelectedBudgetItems = getUniqueCategoryItems(selectedBudgetItems);

  const plannedIncome = uniqueSelectedBudgetItems
    .filter((item) => item.group.trim() === "Income")
    .reduce((sum, item) => sum + (parseAmount(item.targetAmount) ?? 0), 0);

  const plannedExpenses = uniqueSelectedBudgetItems
    .filter((item) => item.group.trim() !== "Income")
    .reduce((sum, item) => sum + (parseAmount(item.targetAmount) ?? 0), 0);

  const totalAccountBalance = accounts.reduce(
    (sum, account) => sum + (parseAmount(account.balance) ?? 0),
    0,
  );

  const selectedPacks = selectedPackIds.flatMap((packId) => {
    const pack = onboardingBudgetPacks.find((candidate) => candidate.id === packId);
    return pack ? [pack] : [];
  });

  const categoryOptions = uniqueSelectedBudgetItems
    .map((item) => ({
      key: getBudgetItemCategoryKey(item),
      label: `${item.name.trim()} · ${item.group.trim()}`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const sidebarSummary =
    step === 1
      ? {
          eyebrow: "Budget setup",
          title: `Shape the first budget for ${launchMonthLabel}`,
          description:
            "Start with the common monthly lines, then layer on packs for life situations you already know belong in the plan.",
          metrics: [
            { label: "Launch month", value: launchMonthLabel },
            {
              label: "Budget items",
              value: String(uniqueSelectedBudgetItems.length),
            },
            {
              label: "Planned income",
              value: formatCurrency(plannedIncome),
              emphasize: true,
            },
            {
              label: "Planned expenses",
              value: formatCurrency(plannedExpenses),
            },
            { label: "Accounts", value: String(accounts.length) },
            { label: "Recurring", value: String(recurringTransactions.length) },
          ],
        }
      : step === 2
        ? {
            eyebrow: "Account setup",
            title: "Add the accounts this app will track",
            description:
              "Start with the cash and debt surfaces you actually watch. Balances can be rough opening numbers and refined later.",
            metrics: [
              { label: "Launch month", value: launchMonthLabel },
              { label: "Tracked accounts", value: String(accounts.length) },
              {
                label: "Opening net balance",
                value: formatCurrency(totalAccountBalance),
              },
              {
                label: "Budget lines",
                value: String(uniqueSelectedBudgetItems.length),
              },
              { label: "Recurring", value: String(recurringTransactions.length) },
            ],
          }
        : {
            eyebrow: "Recurring setup",
            title: "Add recurring commitments",
            description:
              "These are templates only. No transactions are created yet, but the fixed monthly obligations are preserved from the start.",
            metrics: [
              { label: "Launch month", value: launchMonthLabel },
              {
                label: "Recurring templates",
                value: String(recurringTransactions.length),
              },
              {
                label: "Budget categories ready",
                value: String(categoryOptions.length),
              },
              {
                label: "Budget lines",
                value: String(uniqueSelectedBudgetItems.length),
              },
              { label: "Accounts", value: String(accounts.length) },
            ],
          };

  const categoryOptionSignature = categoryOptions
    .map((option) => option.key)
    .join("|");
  const firstCategoryKey = categoryOptions[0]?.key ?? "";

  useEffect(() => {
    if (categoryOptions.length === 0) {
      setRecurringTransactions((current) =>
        current.length === 0 ? current : [],
      );
      return;
    }

    const validCategoryKeys = new Set(categoryOptionSignature.split("|"));

    setRecurringTransactions((current) =>
      current.some(
        (transaction) => !validCategoryKeys.has(transaction.categoryKey),
      )
        ? current.map((transaction) =>
            validCategoryKeys.has(transaction.categoryKey)
              ? transaction
              : {
                  ...transaction,
                  categoryKey: firstCategoryKey,
                },
          )
        : current,
    );
  }, [categoryOptionSignature, firstCategoryKey, categoryOptions.length]);

  const resetErrors = () => {
    setStepError(null);
    setSubmitError(null);
  };

  const validateBudgetStep = () => {
    if (selectedBudgetItems.length === 0) {
      return "Keep at least one budget line in the first month.";
    }

    const seenKeys = new Set<string>();

    for (const item of selectedBudgetItems) {
      const name = item.name.trim();
      const group = item.group.trim();
      const targetAmount = parseAmount(item.targetAmount);

      if (!name) {
        return "Each budget line needs a category name.";
      }

      if (!group) {
        return "Each budget line needs a group.";
      }

      if (targetAmount === null || targetAmount < 0) {
        return "Budget targets must be valid amounts greater than or equal to zero.";
      }

      const key = getBudgetItemCategoryKey({ name, group });

      if (seenKeys.has(key)) {
        return "Each budget line needs a unique category and group combination.";
      }

      seenKeys.add(key);
    }

    return null;
  };

  const validateAccountsStep = () => {
    if (accounts.length === 0) {
      return "Add at least one account before finishing setup.";
    }

    for (const account of accounts) {
      if (!account.name.trim()) {
        return "Each account needs a name.";
      }

      if (parseAmount(account.balance) === null) {
        return "Each account needs a valid opening balance.";
      }
    }

    return null;
  };

  const validateRecurringStep = () => {
    for (const recurring of recurringTransactions) {
      if (!recurring.merchant.trim()) {
        return "Recurring templates need a merchant or reminder label.";
      }

      const amount = parseAmount(recurring.amount);

      if (amount === null || amount <= 0) {
        return "Recurring amounts must be positive numbers.";
      }

      const recurringDate = Number(recurring.recurringDate);

      if (
        !Number.isInteger(recurringDate) ||
        recurringDate < 1 ||
        recurringDate > 31
      ) {
        return "Recurring dates must be whole numbers between 1 and 31.";
      }

      if (
        !recurring.categoryKey ||
        !categoryOptions.some((option) => option.key === recurring.categoryKey)
      ) {
        return "Each recurring template needs a matching budget category.";
      }
    }

    return null;
  };

  const goToNextStep = () => {
    const nextError =
      step === 1 ? validateBudgetStep() : validateAccountsStep();

    if (nextError) {
      setStepError(nextError);
      return;
    }

    resetErrors();
    setStep((currentStep) => Math.min(3, currentStep + 1));
  };

  const goToPreviousStep = () => {
    resetErrors();
    setStep((currentStep) => Math.max(1, currentStep - 1));
  };

  const finishOnboarding = async () => {
    const budgetError = validateBudgetStep();
    if (budgetError) {
      setStep(1);
      setStepError(budgetError);
      return;
    }

    const accountsError = validateAccountsStep();
    if (accountsError) {
      setStep(2);
      setStepError(accountsError);
      return;
    }

    const recurringError = validateRecurringStep();
    if (recurringError) {
      setStep(3);
      setStepError(recurringError);
      return;
    }

    if (!areCategoriesReady) {
      setStepError("Categories are still loading. Try again in a moment.");
      return;
    }

    resetErrors();
    setIsSubmitting(true);

    try {
      await completeOnboarding({
        month: launchMonth,
        year: launchYear,
        budgetItems: uniqueSelectedBudgetItems.map((item) => ({
          name: item.name.trim(),
          group: item.group.trim(),
          targetAmount: parseAmount(item.targetAmount) ?? 0,
        })),
        accounts: accounts.map((account) => ({
          name: account.name.trim(),
          type: account.type,
          balance: parseAmount(account.balance) ?? 0,
        })),
        recurringTransactions: recurringTransactions.map((transaction) => ({
          merchant: transaction.merchant.trim(),
          amount: parseAmount(transaction.amount) ?? 0,
          recurringDate: Number(transaction.recurringDate),
          categoryKey: transaction.categoryKey,
          notes: transaction.notes.trim(),
        })),
        existingCategories,
      });

      await navigate({ to: "/budget" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to finish onboarding right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVisibleBudgetItem = (
    itemId: string,
    field: "name" | "group" | "targetAmount" | "enabled",
    value: string | boolean,
  ) => {
    resetErrors();

    if (coreItems.some((item) => item.id === itemId)) {
      setCoreItems((current) =>
        current.map((item) =>
          item.id === itemId ? updateBudgetItemDraft(item, field, value) : item,
        ),
      );
      return;
    }

    if (customItems.some((item) => item.id === itemId)) {
      setCustomItems((current) =>
        current.map((item) =>
          item.id === itemId ? updateBudgetItemDraft(item, field, value) : item,
        ),
      );
      return;
    }

    const packId = selectedPackIds.find((candidatePackId) =>
      (packItems[candidatePackId] ?? []).some((item) => item.id === itemId),
    );

    if (!packId) {
      return;
    }

    setPackItems((current) => ({
      ...current,
      [packId]: (current[packId] ?? []).map((item) =>
        item.id === itemId ? updateBudgetItemDraft(item, field, value) : item,
      ),
    }));
  };

  const deleteVisibleBudgetItem = (itemId: string) => {
    updateVisibleBudgetItem(itemId, "enabled", false);
  };

  const moveVisibleBudgetItemToGroup = (itemId: string, groupName: string) => {
    const canonicalGroupName = getCanonicalGroupName(visibleBudgetItems, groupName);

    if (!canonicalGroupName) {
      return;
    }

    updateVisibleBudgetItem(itemId, "group", canonicalGroupName);
  };

  return (
    <OnboardingShell
      aside={
        <div>
          <OnboardingSidebarSummary
            eyebrow={sidebarSummary.eyebrow}
            title={sidebarSummary.title}
            description={sidebarSummary.description}
            metrics={sidebarSummary.metrics}
            selectedPacks={selectedPacks}
          />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-10"
        >
          {step === 1 ? (
            <BudgetSetupStep
              coreItems={coreItems}
              customItems={customItems}
              packItems={packItems}
              selectedPackIds={selectedPackIds}
              error={stepError}
              onTogglePack={(packId) => {
                resetErrors();
                setSelectedPackIds((current) =>
                  current.includes(packId)
                    ? current.filter(
                        (currentPackId) => currentPackId !== packId,
                      )
                    : [...current, packId],
                );
              }}
              onUpdateCoreItem={(itemId, field, value) => {
                updateVisibleBudgetItem(itemId, field, value);
              }}
              onUpdatePackItem={(packId, itemId, field, value) => {
                resetErrors();
                setPackItems((current) => ({
                  ...current,
                  [packId]: (current[packId] ?? []).map((item) =>
                    item.id === itemId
                      ? updateBudgetItemDraft(item, field, value)
                      : item,
                  ),
                }));
              }}
              onUpdateCustomItem={(itemId, field, value) => {
                updateVisibleBudgetItem(itemId, field, value);
              }}
              onAddCustomItem={(groupName) => {
                resetErrors();
                const canonicalGroupName = getCanonicalGroupName(
                  visibleBudgetItems,
                  groupName,
                );

                setCustomItems((current) => [
                  ...current,
                  createCustomBudgetItemDraft({
                    group: canonicalGroupName,
                    name: getNextCustomLineName(
                      [
                        ...coreItems,
                        ...selectedPackIds.flatMap(
                          (packId) => packItems[packId] ?? [],
                        ),
                        ...current,
                      ],
                      canonicalGroupName,
                    ),
                  }),
                ]);
              }}
              onAddGroup={(groupName) => {
                resetErrors();
                const normalizedGroupName = normalizeBudgetGroup(groupName);
                const canonicalGroupName = getCanonicalGroupName(
                  visibleBudgetItems,
                  normalizedGroupName,
                );

                if (!canonicalGroupName) {
                  return;
                }

                setCustomItems((current) => [
                  ...current,
                  createCustomBudgetItemDraft({
                    group: canonicalGroupName,
                    name: getNextCustomLineName(
                      [
                        ...coreItems,
                        ...selectedPackIds.flatMap(
                          (packId) => packItems[packId] ?? [],
                        ),
                        ...current,
                      ],
                      canonicalGroupName,
                    ),
                  }),
                ]);
              }}
              onDeleteItem={deleteVisibleBudgetItem}
              onMoveItemToGroup={moveVisibleBudgetItemToGroup}
            />
          ) : null}

          {step === 2 ? (
            <AccountSetupStep
              accounts={accounts}
              error={stepError}
              onAddStarter={(starterId) => {
                resetErrors();
                const starter =
                  onboardingAccountStarters.find(
                    (candidate) => candidate.id === starterId,
                  ) ?? onboardingAccountStarters[0];

                const existingCount = accounts.filter(
                  (account) => account.name === starter.name,
                ).length;
                const name =
                  existingCount === 0
                    ? starter.name
                    : `${starter.name} ${existingCount + 1}`;

                setAccounts((current) => [
                  ...current,
                  createAccountDraft({ ...starter, name }),
                ]);
              }}
              onAddBlankAccount={() => {
                resetErrors();
                setAccounts((current) => [
                  ...current,
                  createAccountDraft({
                    id: "blank",
                    name: "",
                    type: "checking",
                    balance: "0.00",
                  }),
                ]);
              }}
              onUpdateAccount={(accountId, field, value) => {
                resetErrors();
                setAccounts((current) =>
                  current.map((account) =>
                    account.id === accountId
                      ? updateAccountDraft(account, field, value)
                      : account,
                  ),
                );
              }}
              onRemoveAccount={(accountId) => {
                resetErrors();
                setAccounts((current) =>
                  current.filter((account) => account.id !== accountId),
                );
              }}
            />
          ) : null}

          {step === 3 ? (
            <RecurringSetupStep
              recurringTransactions={recurringTransactions}
              categoryOptions={categoryOptions}
              error={stepError}
              onAddRecurring={() => {
                resetErrors();
                setRecurringTransactions((current) => [
                  ...current,
                  createRecurringDraft(categoryOptions[0]?.key ?? ""),
                ]);
              }}
              onUpdateRecurring={(recurringId, field, value) => {
                resetErrors();
                setRecurringTransactions((current) =>
                  current.map((transaction) =>
                    transaction.id === recurringId
                      ? updateRecurringDraft(transaction, field, value)
                      : transaction,
                  ),
                );
              }}
              onRemoveRecurring={(recurringId) => {
                resetErrors();
                setRecurringTransactions((current) =>
                  current.filter(
                    (transaction) => transaction.id !== recurringId,
                  ),
                );
              }}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <section className="mt-10 rounded-[1.75rem] border border-zinc-950/8 bg-white/70 px-6 py-5 dark:border-white/10 dark:bg-white/4">
        <div className="space-y-2">
          <Subheading>What gets created</Subheading>
          <Text>
            One live monthly budget, {uniqueSelectedBudgetItems.length} budget
            items, {accounts.length} accounts, and{" "}
            {recurringTransactions.length === 0
              ? "no recurring templates yet."
              : `${recurringTransactions.length} recurring templates.`}
          </Text>
        </div>
      </section>

      {submitError ? (
        <Text className="mt-6 text-rose-600 dark:text-rose-400">
          {submitError}
        </Text>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t border-zinc-950/8 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <Button
          plain
          onClick={goToPreviousStep}
          disabled={step === 1 || isSubmitting}
        >
          <ArrowLeftIcon data-slot="icon" />
          Back
        </Button>

        {step < 3 ? (
          <Button color="dark/zinc" onClick={goToNextStep}>
            Continue
            <ArrowRightIcon data-slot="icon" />
          </Button>
        ) : (
          <Button
            color="emerald"
            onClick={() => void finishOnboarding()}
            disabled={isSubmitting || !areCategoriesReady}
          >
            <CheckIcon data-slot="icon" />
            {isSubmitting ? "Finishing setup..." : "Finish setup"}
          </Button>
        )}
      </div>
    </OnboardingShell>
  );
}
