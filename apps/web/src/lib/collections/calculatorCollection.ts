import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { type Calculator, CalculatorSchema, type JsonObject } from 'schemas'
import { uuidv7 } from 'uuidv7'

import { API } from '../api'
import { queryClient } from '../integrations/queryClient'

type CreateCalculatorInput = {
  name: string
  calculatorType: Calculator['calculatorType']
  data: JsonObject
}

const normalizeCalculator = (calculator: Calculator) => ({
  ...calculator,
  shareToken: calculator.shareToken ?? null,
  createdAt: calculator.createdAt ? new Date(calculator.createdAt) : undefined,
  updatedAt: calculator.updatedAt ? new Date(calculator.updatedAt) : undefined,
})

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
      const { data } = await API.calculators.fetch()
      return data.map(normalizeCalculator)
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0]
      await API.calculators.update(original.id, normalizeCalculatorUpdate(modified))
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified
      await API.calculators.delete(item.id)
    },
  })
)

export const createCalculatorScenario = async ({
  calculatorType,
  data,
  name,
}: CreateCalculatorInput) => {
  const id = uuidv7()

  await API.calculators.create({
    id,
    calculatorType,
    data,
    name,
  })

  await calculatorCollection.utils.refetch()

  return id
}

export const duplicateCalculatorScenario = async (calculatorId: string) => {
  const response = await API.calculators.duplicate(calculatorId)
  await calculatorCollection.utils.refetch()
  return response.data
}

export const shareCalculatorScenario = async (calculatorId: string) => {
  const response = await API.calculators.share(calculatorId)
  await calculatorCollection.utils.refetch()
  return response.data.shareToken
}

export const unshareCalculatorScenario = async (calculatorId: string) => {
  await API.calculators.unshare(calculatorId)
  await calculatorCollection.utils.refetch()
}
