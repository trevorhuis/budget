import type { Account } from '~/lib/schemas'

import { DELETE, GET, POST, PUT, apiUrl, type ApiResponse } from '~/lib/api/core'

type CreateAccountInput = Omit<Account, 'createdAt' | 'updatedAt' | 'userId'>
type UpdateAccountInput = Pick<Account, 'name' | 'type' | 'balance'>

export const accountsApi = {
  fetch: () => GET<ApiResponse<Account[]>>(apiUrl('/api/accounts')),
  create: (account: CreateAccountInput) =>
    POST<CreateAccountInput>(apiUrl('/api/accounts'), account),
  update: (accountId: Account['id'], account: UpdateAccountInput) =>
    PUT<UpdateAccountInput>(apiUrl(`/api/accounts/${accountId}`), account),
  delete: (accountId: Account['id']) =>
    DELETE<ApiResponse<{ accountId: Account['id'] }>>(
      apiUrl(`/api/accounts/${accountId}`)
    ),
}
