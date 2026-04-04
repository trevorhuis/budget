import type { Calculator } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse, type ApiSuccess } from '~/lib/api/core'

type CreateCalculatorInput = Omit<
  Calculator,
  'createdAt' | 'updatedAt' | 'userId' | 'shareToken'
>

type UpdateCalculatorInput = Pick<Calculator, 'name' | 'calculatorType' | 'data'>

export const normalizeCalculator = (calculator: Calculator) => ({
  ...calculator,
  shareToken: calculator.shareToken ?? null,
  createdAt: calculator.createdAt ? new Date(calculator.createdAt) : undefined,
  updatedAt: calculator.updatedAt ? new Date(calculator.updatedAt) : undefined,
})

export const calculatorsApi = {
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
}

export const fetchSharedCalculator = calculatorsApi.fetchShared
