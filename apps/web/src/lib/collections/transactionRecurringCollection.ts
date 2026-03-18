import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { TransactionRecurringSchema, type TransactionRecurring } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const transactionRecurringCollection = createCollection(
  queryCollectionOptions({
    schema: TransactionRecurringSchema,
    queryClient,
    queryKey: ['transactionRecurring'],
    getKey: (transactionRecurring) => transactionRecurring.id,
    queryFn: async () =>
      getCollectionData<TransactionRecurring>('/api/transactions/recurring'),
    ...createCrudHandlers<TransactionRecurring>('/api/transactions/recurring'),
  })
)
