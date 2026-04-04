import type { Calculator } from '~/lib/schemas'
import { getCalculatorDefinition } from '~/lib/calculators/definitions'
import { formatPercent } from '~/lib/calculators/format'
import {
  calculateDebtPayoff,
  calculateLoan,
  calculateMortgage,
} from '~/lib/calculators/math'

export const sortCalculatorsByUpdatedAt = <T extends { updatedAt?: Date }>(
  calculators: T[]
) =>
  [...calculators].sort(
    (left, right) =>
      (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0)
  )

export const getCalculatorSummary = (calculator: Calculator) => {
  switch (calculator.calculatorType) {
    case 'mortgage': {
      const result = calculateMortgage(
        getCalculatorDefinition('mortgage').parseData(calculator.data)
      )
      return {
        monthlyPayment: result.monthlyPiti,
        totalInterest: result.totalInterest,
        helper: result.pmiApplied ? 'Includes PMI inside insurance.' : 'Fixed PITI snapshot.',
      }
    }
    case 'loan': {
      const result = calculateLoan(
        getCalculatorDefinition('loan').parseData(calculator.data)
      )
      return {
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        helper: `True APR ${formatPercent(result.trueApr)} after fees.`,
      }
    }
    case 'debtPayoff': {
      const result = calculateDebtPayoff(
        getCalculatorDefinition('debtPayoff').parseData(calculator.data)
      )
      return {
        monthlyPayment: result.acceleratedMonthlyPayment,
        totalInterest: result.totalInterest,
        helper: result.canPayOff
          ? `Payoff target ${result.payoffDateLabel}.`
          : 'Current payment does not amortize the balance.',
      }
    }
  }
}

export const getScenarioDisplay = (calculator: Calculator) => ({
  definition: getCalculatorDefinition(calculator.calculatorType),
  summary: getCalculatorSummary(calculator),
})

