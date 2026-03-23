import type {
  Account,
  BulkTransactionCommitRequest,
  BulkTransactionPreviewResponse,
  Budget,
  BudgetItem,
  Calculator,
  Category,
  RecurringTransaction,
  Transaction,
} from 'schemas'

export type {
  BulkTransactionCommitRequest,
  BulkTransactionPreviewRow,
  BulkTransactionPreviewResponse,
} from 'schemas'

type ApiResponse<TData> = {
  data: TData
}

type ApiSuccess = {
  success: true
}

type BulkTransactionCommitResponse = {
  createdCount: number
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

type CreateAccountInput = Omit<Account, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateAccountInput = Pick<Account, 'name' | 'type' | 'balance'>

type CreateBudgetInput = Omit<Budget, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateBudgetInput = Pick<Budget, 'month' | 'year'>

type CreateCategoryInput = Omit<Category, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateCategoryInput = Pick<Category, 'name' | 'group' | 'status'>

type CreateBudgetItemInput = Omit<BudgetItem, 'createdAt' | 'updatedAt'>
type UpdateBudgetItemInput = Partial<
  Pick<BudgetItem, 'actualAmount' | 'targetAmount'>
>

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

type CreateCalculatorInput = Omit<
  Calculator,
  'createdAt' | 'updatedAt' | 'userId' | 'shareToken'
>
type UpdateCalculatorInput = Pick<Calculator, 'name' | 'calculatorType' | 'data'>

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

if (import.meta.env.PROD && apiBaseUrl === '') {
  throw new Error('VITE_API_BASE_URL is required in production')
}

const apiUrl = (path: string) =>
  apiBaseUrl ? new URL(path, apiBaseUrl).toString() : path

const isAuthPage = (pathname: string) =>
  pathname === '/login' || pathname === '/register'

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/budget'
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

const redirectToLogin = () => {
  if (typeof window === 'undefined' || isAuthPage(window.location.pathname)) {
    return
  }

  const redirect = encodeURIComponent(getCurrentPath())
  window.location.assign(`/login?redirect=${redirect}`)
}

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null

    if (payload?.error) {
      return payload.error
    }

    if (payload?.message) {
      return payload.message
    }
  }

  return `Request failed: ${response.status} ${response.statusText}`
}

export const authenticatedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  })

  if (response.status === 401) {
    redirectToLogin()
  }

  return response
}

const request = async <TResponse>(
  url: string,
  init?: RequestInit
): Promise<TResponse> => {
  const headers = new Headers(init?.headers ?? {})
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData

  if (!isFormData && init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await authenticatedFetch(url, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    throw new UnauthorizedError()
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export const GET = async <TResponse>(url: string): Promise<TResponse> => {
  return request<TResponse>(url)
}

export const POST = async <TBody extends object, TResponse = ApiSuccess>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const POST_FORM = async <TResponse>(
  url: string,
  body: FormData
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'POST',
    body,
  })
}

export const PUT = async <TBody extends object, TResponse = ApiSuccess>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const DELETE = async <TResponse = ApiSuccess>(
  url: string
): Promise<TResponse> => {
  return request<TResponse>(url, { method: 'DELETE' })
}

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

export const API = {
  health: {
    check: () =>
      authenticatedFetch(apiUrl('/api/health')).then((response) =>
        response.text()
      ),
  },
  accounts: {
    fetch: () => GET<ApiResponse<Account[]>>(apiUrl('/api/accounts')),
    create: (account: CreateAccountInput) =>
      POST<CreateAccountInput>(apiUrl('/api/accounts'), account),
    update: (accountId: Account['id'], account: UpdateAccountInput) =>
      PUT<UpdateAccountInput>(apiUrl(`/api/accounts/${accountId}`), account),
    delete: (accountId: Account['id']) =>
      DELETE<ApiResponse<{ accountId: Account['id'] }>>(
        apiUrl(`/api/accounts/${accountId}`)
      ),
  },
  budgets: {
    fetch: () => GET<ApiResponse<Budget[]>>(apiUrl('/api/budgets')),
    create: (budget: CreateBudgetInput) =>
      POST<CreateBudgetInput>(apiUrl('/api/budgets'), budget),
    update: (budgetId: Budget['id'], budget: UpdateBudgetInput) =>
      PUT<UpdateBudgetInput>(apiUrl(`/api/budgets/${budgetId}`), budget),
    delete: (budgetId: Budget['id']) =>
      DELETE<ApiResponse<{ budgetId: Budget['id'] }>>(
        apiUrl(`/api/budgets/${budgetId}`)
      ),
  },
  categories: {
    fetch: () => GET<ApiResponse<Category[]>>(apiUrl('/api/categories')),
    create: (category: CreateCategoryInput) =>
      POST<CreateCategoryInput>(apiUrl('/api/categories'), category),
    update: (categoryId: Category['id'], category: UpdateCategoryInput) =>
      PUT<UpdateCategoryInput>(apiUrl(`/api/categories/${categoryId}`), category),
    delete: (categoryId: Category['id']) =>
      DELETE<ApiResponse<{ categoryId: Category['id'] }>>(
        apiUrl(`/api/categories/${categoryId}`)
      ),
  },
  calculators: {
    fetch: () => GET<ApiResponse<Calculator[]>>(apiUrl('/api/calculators')),
    fetchById: (calculatorId: Calculator['id']) =>
      GET<ApiResponse<Calculator>>(apiUrl(`/api/calculators/${calculatorId}`)),
    fetchShared: (shareToken: string) =>
      GET<ApiResponse<Calculator>>(
        apiUrl(`/api/calculators/shared/${shareToken}`)
      ),
    create: (calculator: CreateCalculatorInput) =>
      POST<CreateCalculatorInput>(apiUrl('/api/calculators'), calculator),
    update: (calculatorId: Calculator['id'], calculator: UpdateCalculatorInput) =>
      PUT<UpdateCalculatorInput>(apiUrl(`/api/calculators/${calculatorId}`), calculator),
    duplicate: (calculatorId: Calculator['id']) =>
      POST<Record<string, never>, ApiResponse<Pick<Calculator, 'id' | 'name' | 'calculatorType' | 'data'>>>(
        apiUrl(`/api/calculators/${calculatorId}/duplicate`),
        {}
      ),
    share: (calculatorId: Calculator['id']) =>
      POST<Record<string, never>, ApiResponse<{ shareToken: string }>>(
        apiUrl(`/api/calculators/${calculatorId}/share`),
        {}
      ),
    unshare: (calculatorId: Calculator['id']) =>
      DELETE<ApiSuccess>(apiUrl(`/api/calculators/${calculatorId}/share`)),
    delete: (calculatorId: Calculator['id']) =>
      DELETE<ApiResponse<{ calculatorId: Calculator['id'] }>>(
        apiUrl(`/api/calculators/${calculatorId}`)
      ),
  },
  budgetItems: {
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
  },
  transactions: {
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
  },
  recurringTransactions: {
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
  },
}
