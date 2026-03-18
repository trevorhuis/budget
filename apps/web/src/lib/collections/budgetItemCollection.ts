import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { BudgetItemSchema, type BudgetItem } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const budgetItemCollection = createCollection(
  queryCollectionOptions({
    schema: BudgetItemSchema,
    queryClient,
    queryKey: ['budgetItems'],
    getKey: (budgetItem) => budgetItem.id,
    queryFn: async () => getCollectionData<BudgetItem>('/api/budgetItems'),
    ...createCrudHandlers<BudgetItem>('/api/budgetItems'),
  })
)
