import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { CategorySchema, type Category } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const categoryCollection = createCollection(
  queryCollectionOptions({
    schema: CategorySchema,
    queryClient,
    queryKey: ['categories'],
    getKey: (category) => category.id,
    queryFn: async () => getCollectionData<Category>('/api/categories'),
    ...createCrudHandlers<Category>('/api/categories'),
  })
)
