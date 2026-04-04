import type { Category } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse } from '~/lib/api/core'

type CreateCategoryInput = Omit<Category, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateCategoryInput = Pick<Category, 'name' | 'group' | 'status'>

export const categoriesApi = {
  fetch: () => GET<ApiResponse<Category[]>>(apiUrl('/api/categories')),
  create: (category: CreateCategoryInput) =>
    POST<CreateCategoryInput>(apiUrl('/api/categories'), category),
  update: (categoryId: Category['id'], category: UpdateCategoryInput) =>
    PUT<UpdateCategoryInput>(apiUrl(`/api/categories/${categoryId}`), category),
  delete: (categoryId: Category['id']) =>
    DELETE<ApiResponse<{ categoryId: Category['id'] }>>(
      apiUrl(`/api/categories/${categoryId}`)
    ),
}
