import type { Account, Category } from "~/lib/schemas";
import { uuidv7 } from "uuidv7";

import { accountsApi } from "~/lib/api/accounts";
import { budgetItemsApi } from "~/lib/api/budgetItems";
import { budgetsApi } from "~/lib/api/budgets";
import { categoriesApi } from "~/lib/api/categories";
import { recurringTransactionsApi } from "~/lib/api/recurringTransactions";
import { accountCollection } from "~/lib/collections/accountCollection";
import { budgetCollection } from "~/lib/collections/budgetCollection";
import { budgetItemCollection } from "~/lib/collections/budgetItemCollection";
import { categoryCollection } from "~/lib/collections/categoryCollection";
import { recurringTransactionCollection } from "~/lib/collections/transactionRecurringCollection";

export type OnboardingBudgetItemTemplate = {
  id: string;
  name: string;
  group: string;
  description: string;
  defaultTargetAmount: number;
};

export type OnboardingPack = {
  id: string;
  name: string;
  description: string;
  accent: "amber" | "emerald" | "sky" | "rose";
  items: OnboardingBudgetItemTemplate[];
};

export type OnboardingBudgetItemDraft = {
  id: string;
  name: string;
  group: string;
  description: string;
  targetAmount: string;
  enabled: boolean;
  isCustom: boolean;
};

export type OnboardingAccountDraft = {
  id: string;
  name: string;
  type: Account["type"];
  balance: string;
};

type OnboardingAccountStarter = {
  id: string;
  name: string;
  type: Account["type"];
  balance: string;
};

export type OnboardingRecurringDraft = {
  id: string;
  merchant: string;
  amount: string;
  recurringDate: string;
  categoryKey: string;
  notes: string;
};

export const onboardingCoreBudgetItems: OnboardingBudgetItemTemplate[] = [
  {
    id: "income-primary-paycheck",
    name: "Primary paycheck",
    group: "Income",
    description: "Main household income for the month.",
    defaultTargetAmount: 4200,
  },
  {
    id: "housing-rent-mortgage",
    name: "Rent or mortgage",
    group: "Housing",
    description: "The main fixed payment that anchors the month.",
    defaultTargetAmount: 1500,
  },
  {
    id: "utilities-bills",
    name: "Utilities",
    group: "Utilities",
    description: "Power, water, gas, trash, and other essential services.",
    defaultTargetAmount: 260,
  },
  {
    id: "food-groceries",
    name: "Groceries",
    group: "Food",
    description: "Weekly food shopping for the household.",
    defaultTargetAmount: 500,
  },
  {
    id: "food-dining",
    name: "Dining out",
    group: "Food",
    description: "Restaurants, coffee, delivery, and takeout.",
    defaultTargetAmount: 175,
  },
  {
    id: "transportation-fuel",
    name: "Transportation",
    group: "Transportation",
    description: "Fuel, parking, transit, and vehicle basics.",
    defaultTargetAmount: 240,
  },
  {
    id: "insurance-coverage",
    name: "Insurance",
    group: "Insurance",
    description: "Auto, health, renter's, or other core coverage.",
    defaultTargetAmount: 260,
  },
  {
    id: "everyday-phone-internet",
    name: "Phone and internet",
    group: "Everyday",
    description: "Connectivity expenses that hit every month.",
    defaultTargetAmount: 120,
  },
  {
    id: "savings-goals",
    name: "Savings",
    group: "Savings",
    description: "Cash set aside for reserves or near-term goals.",
    defaultTargetAmount: 300,
  },
  {
    id: "lifestyle-fun",
    name: "Fun money",
    group: "Lifestyle",
    description: "Flexible room for entertainment and impulse spend.",
    defaultTargetAmount: 150,
  },
];

export const onboardingBudgetPacks: OnboardingPack[] = [
  {
    id: "kids",
    name: "Kids",
    description:
      "Common family costs that show up fast once school, care, and activities start.",
    accent: "sky",
    items: [
      {
        id: "kids-childcare",
        name: "Childcare",
        group: "Kids",
        description: "Daycare, after-school care, or babysitting.",
        defaultTargetAmount: 900,
      },
      {
        id: "kids-school",
        name: "School costs",
        group: "Kids",
        description: "Lunches, fees, supplies, and field trip spend.",
        defaultTargetAmount: 125,
      },
      {
        id: "kids-activities",
        name: "Activities",
        group: "Kids",
        description: "Sports, lessons, clubs, and seasonal programs.",
        defaultTargetAmount: 140,
      },
      {
        id: "kids-clothing",
        name: "Clothing",
        group: "Kids",
        description: "Growth spurts, uniforms, and basics.",
        defaultTargetAmount: 90,
      },
    ],
  },
  {
    id: "pets",
    name: "Pets",
    description:
      "Routine food, vet, and care lines for animals you plan around every month.",
    accent: "emerald",
    items: [
      {
        id: "pets-food",
        name: "Pet food",
        group: "Pets",
        description: "Food, litter, and routine consumables.",
        defaultTargetAmount: 80,
      },
      {
        id: "pets-vet",
        name: "Vet care",
        group: "Pets",
        description: "Checkups, medication, and ongoing care.",
        defaultTargetAmount: 75,
      },
      {
        id: "pets-grooming",
        name: "Grooming and boarding",
        group: "Pets",
        description: "Grooming, daycare, or occasional boarding.",
        defaultTargetAmount: 55,
      },
      {
        id: "pets-insurance",
        name: "Pet insurance",
        group: "Pets",
        description: "Coverage for larger surprise bills.",
        defaultTargetAmount: 40,
      },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    description:
      "A steady monthly line for trips so seasonal travel does not crush one month.",
    accent: "amber",
    items: [
      {
        id: "travel-flights",
        name: "Travel fund",
        group: "Travel",
        description: "Flights, hotels, or annual trip savings.",
        defaultTargetAmount: 200,
      },
      {
        id: "travel-local",
        name: "Weekend outings",
        group: "Travel",
        description: "Short drives, event weekends, and small escapes.",
        defaultTargetAmount: 90,
      },
    ],
  },
  {
    id: "home",
    name: "Home",
    description:
      "Maintenance and household upkeep that do not fit the essentials bucket cleanly.",
    accent: "rose",
    items: [
      {
        id: "home-repairs",
        name: "Repairs and maintenance",
        group: "Home",
        description: "Small fixes, tools, and seasonal upkeep.",
        defaultTargetAmount: 120,
      },
      {
        id: "home-supplies",
        name: "Household supplies",
        group: "Home",
        description: "Cleaning, paper goods, and replacement basics.",
        defaultTargetAmount: 75,
      },
    ],
  },
];

export const onboardingAccountStarters: OnboardingAccountStarter[] = [
  {
    id: "checking",
    name: "Everyday checking",
    type: "checking",
    balance: "0.00",
  },
  {
    id: "savings",
    name: "Emergency savings",
    type: "savings",
    balance: "0.00",
  },
  {
    id: "credit-card",
    name: "Primary credit card",
    type: "creditCard",
    balance: "-0.00",
  },
];

export const accountTypes = [
  "checking",
  "savings",
  "creditCard",
] as const satisfies Array<Account["type"]>;

export const accountTypeLabels: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  creditCard: "Credit card",
};

export const accountTypeBadgeColors: Record<
  Account["type"],
  "sky" | "emerald" | "amber"
> = {
  checking: "sky",
  savings: "emerald",
  creditCard: "amber",
};

export const createBudgetItemDraft = (
  template: OnboardingBudgetItemTemplate,
): OnboardingBudgetItemDraft => ({
  id: uuidv7(),
  name: template.name,
  group: template.group,
  description: template.description,
  targetAmount: template.defaultTargetAmount.toFixed(2),
  enabled: true,
  isCustom: false,
});

export const createCustomBudgetItemDraft = (
  overrides: Partial<
    Pick<
      OnboardingBudgetItemDraft,
      "name" | "group" | "description" | "targetAmount" | "enabled"
    >
  > = {},
): OnboardingBudgetItemDraft => ({
  id: uuidv7(),
  name: overrides.name ?? "",
  group: overrides.group ?? "Everyday",
  description:
    overrides.description ??
    "A custom line you can shape before the first month goes live.",
  targetAmount: overrides.targetAmount ?? "0.00",
  enabled: overrides.enabled ?? true,
  isCustom: true,
});

export const createAccountDraft = (
  starter = onboardingAccountStarters[0],
): OnboardingAccountDraft => ({
  id: uuidv7(),
  name: starter.name,
  type: starter.type,
  balance: starter.balance,
});

export const createRecurringDraft = (
  categoryKey = "",
): OnboardingRecurringDraft => ({
  id: uuidv7(),
  merchant: "",
  amount: "",
  recurringDate: "1",
  categoryKey,
  notes: "",
});

const categoryKey = (name: string, group: string) =>
  `${group.trim().toLowerCase()}::${name.trim().toLowerCase()}`;

let onboardingStatusPromise: Promise<boolean> | null = null;

export const invalidateOnboardingStatus = () => {
  onboardingStatusPromise = null;
};

export const getNeedsOnboarding = async () => {
  if (!onboardingStatusPromise) {
    onboardingStatusPromise = Promise.all([
      budgetsApi.fetch(),
      budgetItemsApi.fetch(),
      accountsApi.fetch(),
    ])
      .then(([budgetsResponse, budgetItemsResponse, accountsResponse]) => {
        return (
          budgetsResponse.data.length === 0 ||
          budgetItemsResponse.data.length === 0 ||
          accountsResponse.data.length === 0
        );
      })
      .catch((error) => {
        onboardingStatusPromise = null;
        throw error;
      });
  }

  return onboardingStatusPromise;
};

type CompleteOnboardingInput = {
  month: number;
  year: number;
  budgetItems: Array<{
    name: string;
    group: string;
    targetAmount: number;
  }>;
  accounts: Array<{
    name: string;
    type: Account["type"];
    balance: number;
  }>;
  recurringTransactions: Array<{
    merchant: string;
    amount: number;
    recurringDate: number;
    categoryKey: string;
    notes: string;
  }>;
  existingCategories: Category[];
};

export const completeOnboarding = async ({
  month,
  year,
  budgetItems,
  accounts,
  recurringTransactions,
  existingCategories,
}: CompleteOnboardingInput) => {
  const categoryIdByKey = new Map<string, string>();
  const existingCategoryByKey = new Map(
    existingCategories.map((category) => [
      categoryKey(category.name, category.group),
      category,
    ]),
  );

  for (const item of budgetItems) {
    const key = categoryKey(item.name, item.group);

    if (categoryIdByKey.has(key)) {
      continue;
    }

    const existingCategory = existingCategoryByKey.get(key);

    if (existingCategory) {
      if (existingCategory.status !== "active") {
        await categoriesApi.update(existingCategory.id, {
          name: existingCategory.name,
          group: existingCategory.group,
          status: "active",
        });
      }

      categoryIdByKey.set(key, existingCategory.id);
      continue;
    }

    const id = uuidv7();

    await categoriesApi.create({
      id,
      name: item.name.trim(),
      group: item.group.trim(),
      status: "active",
    });

    categoryIdByKey.set(key, id);
  }

  const budgetId = uuidv7();

  await budgetsApi.create({
    id: budgetId,
    month,
    year,
  });

  await Promise.all([
    ...budgetItems.map((item) =>
      budgetItemsApi.create({
        id: uuidv7(),
        actualAmount: 0,
        targetAmount: item.targetAmount,
        budgetId,
        categoryId: categoryIdByKey.get(categoryKey(item.name, item.group))!,
      }),
    ),
    ...accounts.map((account) =>
      accountsApi.create({
        id: uuidv7(),
        name: account.name.trim(),
        type: account.type,
        balance: account.balance,
      }),
    ),
    ...recurringTransactions.map((transaction) =>
      recurringTransactionsApi.create({
        id: uuidv7(),
        merchant: transaction.merchant.trim(),
        amount: transaction.amount,
        notes: transaction.notes.trim(),
        recurringDate: transaction.recurringDate,
        categoryId: categoryIdByKey.get(transaction.categoryKey)!,
      }),
    ),
  ]);

  await Promise.all([
    budgetCollection.utils.refetch(),
    budgetItemCollection.utils.refetch(),
    categoryCollection.utils.refetch(),
    accountCollection.utils.refetch(),
    recurringTransactionCollection.utils.refetch(),
  ]);

  invalidateOnboardingStatus();
};

export const getBudgetItemCategoryKey = (item: {
  name: string;
  group: string;
}) => categoryKey(item.name, item.group);
