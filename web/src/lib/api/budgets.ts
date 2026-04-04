import type { Budget } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse } from '~/lib/api/core'

type CreateBudgetInput = Omit<Budget, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateBudgetInput = Pick<Budget, 'month' | 'year'>

export const budgetsApi = {
  fetch: () => GET<ApiResponse<Budget[]>>(apiUrl('/api/budgets')),
  create: (budget: CreateBudgetInput) =>
    POST<CreateBudgetInput>(apiUrl('/api/budgets'), budget),
  update: (budgetId: Budget['id'], budget: UpdateBudgetInput) =>
    PUT<UpdateBudgetInput>(apiUrl(`/api/budgets/${budgetId}`), budget),
  delete: (budgetId: Budget['id']) =>
    DELETE<ApiResponse<{ budgetId: Budget['id'] }>>(
      apiUrl(`/api/budgets/${budgetId}`)
    ),
}
