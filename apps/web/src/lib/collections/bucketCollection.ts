import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { BucketSchema, type Bucket } from 'schemas'
import { queryClient } from '../integrations/queryClient'
import { createCrudHandlers, getCollectionData } from './utils'

export const bucketCollection = createCollection(
  queryCollectionOptions({
    schema: BucketSchema,
    queryClient,
    queryKey: ['buckets'],
    getKey: (bucket) => bucket.id,
    queryFn: async () => getCollectionData<Bucket>('/api/buckets'),
    ...createCrudHandlers<Bucket>('/api/buckets'),
  })
)
