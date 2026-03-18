import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { TransactionSchema, type Transaction } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const transactionCollection = createCollection(
  queryCollectionOptions({
    schema: TransactionSchema,
    queryClient,
    queryKey: ['transactions'],
    getKey: (transaction) => transaction.id,
    queryFn: async () => getCollectionData<Transaction>('/api/transactions'),
    ...createCrudHandlers<Transaction>('/api/transactions'),
  })
)
