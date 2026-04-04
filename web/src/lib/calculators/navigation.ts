export const readSearchParam = (searchStr: string, key: string) =>
  new URLSearchParams(searchStr).get(key)

export const buildScenarioUrl = (path: string, scenarioId: string) =>
  `${path}?scenarioId=${scenarioId}`

export const buildCompareUrl = (leftScenarioId: string, rightScenarioId: string) =>
  `/calculators/compare?left=${leftScenarioId}&right=${rightScenarioId}`

