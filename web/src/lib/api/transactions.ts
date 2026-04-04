import type {
  BulkTransactionCommitRequest,
  BulkTransactionPreviewResponse,
  Transaction,
} from '~/lib/schemas'

import {
  DELETE,
  GET,
  POST,
  POST_FORM,
  PUT,
  apiUrl,
  type ApiResponse,
} from '~/lib/api/core'

export type {
  BulkTransactionCommitRequest,
  BulkTransactionPreviewResponse,
  BulkTransactionPreviewRow,
} from '~/lib/schemas'

type BulkTransactionCommitResponse = {
  createdCount: number
}

type CreateTransactionInput = Omit<
  Transaction,
  'createdAt' | 'updatedAt' | 'userId'
>

type UpdateTransactionInput = Partial<
  Pick<
    Transaction,
    | 'merchant'
    | 'amount'
    | 'notes'
    | 'date'
    | 'type'
    | 'accountId'
    | 'budgetItemId'
    | 'recurringTemplateId'
  >
>

const normalizeBulkTransactionPreviewRow = (
  row: Omit<
    BulkTransactionPreviewResponse['rows'][number],
    'date'
  > & { date: string | Date }
): BulkTransactionPreviewResponse['rows'][number] => ({
  ...row,
  date: row.date instanceof Date ? row.date : new Date(row.date),
  accountId: row.accountId ?? null,
  accountName: row.accountName ?? null,
  budgetItemId: row.budgetItemId ?? null,
  warnings: row.warnings ?? [],
  errors: row.errors ?? [],
})

export const transactionsApi = {
  fetch: () => GET<ApiResponse<Transaction[]>>(apiUrl('/api/transactions')),
  create: (transaction: CreateTransactionInput) =>
    POST<CreateTransactionInput>(apiUrl('/api/transactions'), transaction),
  bulkPreview: async (formData: FormData) => {
    const response = await POST_FORM<
      ApiResponse<{
        previewId: string | null
        rows: Array<
          Omit<
            BulkTransactionPreviewResponse['rows'][number],
            'date'
          > & { date: string | Date }
        >
      }>
    >(apiUrl('/api/transactions/bulk/preview'), formData)

    return {
      data: {
        previewId: response.data.previewId ?? null,
        rows: response.data.rows.map(normalizeBulkTransactionPreviewRow),
      },
    } satisfies ApiResponse<BulkTransactionPreviewResponse>
  },
  bulkCreate: (payload: BulkTransactionCommitRequest) =>
    POST<
      BulkTransactionCommitRequest,
      ApiResponse<BulkTransactionCommitResponse>
    >(apiUrl('/api/transactions/bulk'), payload),
  update: (
    transactionId: Transaction['id'],
    transaction: UpdateTransactionInput
  ) =>
    PUT<UpdateTransactionInput>(
      apiUrl(`/api/transactions/${transactionId}`),
      transaction
    ),
  delete: (transactionId: Transaction['id']) =>
    DELETE<ApiResponse<{ transactionId: Transaction['id'] }>>(
      apiUrl(`/api/transactions/${transactionId}`)
    ),
}

export const previewBulkTransactions = transactionsApi.bulkPreview
export const bulkCreateTransactions = transactionsApi.bulkCreate
