import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { BudgetSchema, type Budget } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const budgetCollection = createCollection(
  queryCollectionOptions({
    schema: BudgetSchema,
    queryClient,
    queryKey: ['budgets'],
    getKey: (budget) => budget.id,
    queryFn: async () => getCollectionData<Budget>('/api/budgets'),
    ...createCrudHandlers<Budget>('/api/budgets'),
  })
)
