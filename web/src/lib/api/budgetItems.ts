import type { BudgetItem } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse } from '~/lib/api/core'

type CreateBudgetItemInput = Omit<BudgetItem, 'createdAt' | 'updatedAt'>
type UpdateBudgetItemInput = Partial<
  Pick<BudgetItem, 'actualAmount' | 'targetAmount'>
>

export const budgetItemsApi = {
  fetch: () => GET<ApiResponse<BudgetItem[]>>(apiUrl('/api/budgetItems')),
  create: (budgetItem: CreateBudgetItemInput) =>
    POST<CreateBudgetItemInput>(apiUrl('/api/budgetItems'), budgetItem),
  update: (
    budgetItemId: BudgetItem['id'],
    budgetItem: UpdateBudgetItemInput
  ) =>
    PUT<UpdateBudgetItemInput>(
      apiUrl(`/api/budgetItems/${budgetItemId}`),
      budgetItem
    ),
  delete: (budgetItemId: BudgetItem['id']) =>
    DELETE<ApiResponse<{ budgetItemId: BudgetItem['id'] }>>(
      apiUrl(`/api/budgetItems/${budgetItemId}`)
    ),
}
