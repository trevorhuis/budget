import { apiUrl, authenticatedFetch } from '~/lib/api/core'

export const healthApi = {
  check: () =>
    authenticatedFetch(apiUrl('/api/health')).then((response) =>
      response.text()
    ),
}
