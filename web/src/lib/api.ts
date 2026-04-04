import { accountsApi } from '~/lib/api/accounts'
import { budgetItemsApi } from '~/lib/api/budgetItems'
import { budgetsApi } from '~/lib/api/budgets'
import { calculatorsApi } from '~/lib/api/calculators'
import { categoriesApi } from '~/lib/api/categories'
import { healthApi } from '~/lib/api/health'
import { recurringTransactionsApi } from '~/lib/api/recurringTransactions'
import { transactionsApi } from '~/lib/api/transactions'

export * from '~/lib/api/core'
export * from '~/lib/api/calculators'
export * from '~/lib/api/transactions'

export const API = {
  health: healthApi,
  accounts: accountsApi,
  budgets: budgetsApi,
  categories: categoriesApi,
  calculators: calculatorsApi,
  budgetItems: budgetItemsApi,
  transactions: transactionsApi,
  recurringTransactions: recurringTransactionsApi,
}
