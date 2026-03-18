import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { queryClient } from '../integrations/queryClient'
import { AccountSchema, type Account } from 'schemas'
import { createCrudHandlers, getCollectionData } from './utils'

export const accountCollection = createCollection(
  queryCollectionOptions({
    schema: AccountSchema,
    queryClient,
    queryKey: ['accounts'],
    getKey: (account) => account.id,
    queryFn: async () => getCollectionData<Account>('/api/accounts'),
    ...createCrudHandlers<Account>('/api/accounts'),
  })
)
