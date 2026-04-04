import type { RecurringTransaction } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse } from '~/lib/api/core'

type CreateRecurringTransactionInput = Omit<
  RecurringTransaction,
  'createdAt' | 'updatedAt' | 'userId'
>

type UpdateRecurringTransactionInput = Partial<
  Pick<
    RecurringTransaction,
    'merchant' | 'amount' | 'notes' | 'recurringDate' | 'categoryId'
  >
>

export const recurringTransactionsApi = {
  fetch: () =>
    GET<ApiResponse<RecurringTransaction[]>>(
      apiUrl('/api/transactions/recurring')
    ),
  create: (transaction: CreateRecurringTransactionInput) =>
    POST<CreateRecurringTransactionInput>(
      apiUrl('/api/transactions/recurring'),
      transaction
    ),
  update: (
    templateId: RecurringTransaction['id'],
    transaction: UpdateRecurringTransactionInput
  ) =>
    PUT<UpdateRecurringTransactionInput>(
      apiUrl(`/api/transactions/recurring/${templateId}`),
      transaction
    ),
  delete: (templateId: RecurringTransaction['id']) =>
    DELETE<ApiResponse<{ templateId: RecurringTransaction['id'] }>>(
      apiUrl(`/api/transactions/recurring/${templateId}`)
    ),
}
