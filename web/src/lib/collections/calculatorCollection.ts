import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  type Calculator,
  CalculatorSchema,
  type JsonObject,
} from '~/lib/schemas'
import { uuidv7 } from 'uuidv7'

import {
  calculatorsApi,
  normalizeCalculator,
} from '~/lib/api/calculators'
import { queryClient } from '~/lib/integrations/queryClient'

type CreateCalculatorInput = {
  name: string
  calculatorType: Calculator['calculatorType']
  data: JsonObject
}

const normalizeCalculatorUpdate = (calculator: Calculator) => ({
  name: calculator.name,
  calculatorType: calculator.calculatorType,
  data: calculator.data,
})

export const calculatorCollection = createCollection(
  queryCollectionOptions({
    schema: CalculatorSchema,
    queryClient,
    queryKey: ['calculators'],
    getKey: (calculator) => calculator.id,
    queryFn: async () => {
      const { data } = await calculatorsApi.fetch()
      return data.map(normalizeCalculator)
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0]
      await calculatorsApi.update(original.id, normalizeCalculatorUpdate(modified))
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified
      await calculatorsApi.delete(item.id)
    },
  })
)

export const createCalculatorScenario = async ({
  calculatorType,
  data,
  name,
}: CreateCalculatorInput) => {
  const id = uuidv7()

  await calculatorsApi.create({
    id,
    calculatorType,
    data,
    name,
  })

  await calculatorCollection.utils.refetch()

  return id
}

export const duplicateCalculatorScenario = async (calculatorId: string) => {
  const response = await calculatorsApi.duplicate(calculatorId)
  await calculatorCollection.utils.refetch()
  return response.data
}

export const shareCalculatorScenario = async (calculatorId: string) => {
  const response = await calculatorsApi.share(calculatorId)
  await calculatorCollection.utils.refetch()
  return response.data.shareToken
}

export const unshareCalculatorScenario = async (calculatorId: string) => {
  await calculatorsApi.unshare(calculatorId)
  await calculatorCollection.utils.refetch()
}
