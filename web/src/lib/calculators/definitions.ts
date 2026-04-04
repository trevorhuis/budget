import { z } from 'zod'
import type { Calculator, JsonObject } from '~/lib/schemas'
import { getToday, toDateInputValue } from '~/lib/calculators/utils'

export type MortgageCalculatorData = JsonObject & {
  homePrice: number
  downPaymentMode: 'amount' | 'percent'
  downPaymentValue: number
  rateType: 'fixed' | 'adjustable'
  interestRate: number
  loanTermYears: 10 | 15 | 20 | 30
  annualPropertyTaxes: number
  annualHomeInsurance: number
  adjustableRate: {
    introFixedYears: number
    adjustmentIntervalYears: number
    rateAdjustment: number
    maxRate: number
  }
}

export type LoanCalculatorData = JsonObject & {
  loanAmount: number
  termUnit: 'months' | 'years'
  termValue: number
  interestRate: number
  startDate: string
  originationFeeMode: 'amount' | 'percent'
  originationFeeValue: number
}

export type DebtPayoffCalculatorData = JsonObject & {
  currentBalance: number
  apr: number
  currentMonthlyPayment: number
  extraMonthlyPayment: number
}

const MortgageCalculatorDataSchema = z.object({
  homePrice: z.number().nonnegative(),
  downPaymentMode: z.enum(['amount', 'percent']),
  downPaymentValue: z.number().nonnegative(),
  rateType: z.enum(['fixed', 'adjustable']),
  interestRate: z.number().nonnegative(),
  loanTermYears: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
  annualPropertyTaxes: z.number().nonnegative(),
  annualHomeInsurance: z.number().nonnegative(),
  adjustableRate: z.object({
    introFixedYears: z.number().positive(),
    adjustmentIntervalYears: z.number().positive(),
    rateAdjustment: z.number().nonnegative(),
    maxRate: z.number().nonnegative(),
  }),
})

const LoanCalculatorDataSchema = z.object({
  loanAmount: z.number().nonnegative(),
  termUnit: z.enum(['months', 'years']),
  termValue: z.number().positive(),
  interestRate: z.number().nonnegative(),
  startDate: z.string().min(1),
  originationFeeMode: z.enum(['amount', 'percent']),
  originationFeeValue: z.number().nonnegative(),
})

const DebtPayoffCalculatorDataSchema = z.object({
  currentBalance: z.number().nonnegative(),
  apr: z.number().nonnegative(),
  currentMonthlyPayment: z.number().nonnegative(),
  extraMonthlyPayment: z.number().nonnegative(),
})

export const defaultMortgageCalculatorData: MortgageCalculatorData = {
  homePrice: 450000,
  downPaymentMode: 'percent',
  downPaymentValue: 20,
  rateType: 'fixed',
  interestRate: 6.75,
  loanTermYears: 30,
  annualPropertyTaxes: 7200,
  annualHomeInsurance: 1800,
  adjustableRate: {
    introFixedYears: 5,
    adjustmentIntervalYears: 1,
    rateAdjustment: 1,
    maxRate: 8.5,
  },
}

export const defaultLoanCalculatorData: LoanCalculatorData = {
  loanAmount: 28000,
  termUnit: 'years',
  termValue: 5,
  interestRate: 7.2,
  startDate: toDateInputValue(getToday()),
  originationFeeMode: 'percent',
  originationFeeValue: 1.5,
}

export const defaultDebtPayoffCalculatorData: DebtPayoffCalculatorData = {
  currentBalance: 12400,
  apr: 21.5,
  currentMonthlyPayment: 360,
  extraMonthlyPayment: 150,
}

export type CalculatorDefinition<TData extends JsonObject> = {
  type: Calculator['calculatorType']
  label: string
  description: string
  path: string
  defaultName: string
  defaultData: TData
  parseData: (value: unknown) => TData
}

export const calculatorDefinitions = {
  mortgage: {
    type: 'mortgage',
    label: 'Mortgage',
    description: 'Model PITI, amortization, and a simple ARM path.',
    path: '/calculators/mortgage',
    defaultName: 'Mortgage Scenario',
    defaultData: defaultMortgageCalculatorData,
    parseData: (value: unknown) => {
      const result = MortgageCalculatorDataSchema.safeParse(value)
      return result.success ? result.data : defaultMortgageCalculatorData
    },
  } satisfies CalculatorDefinition<MortgageCalculatorData>,
  loan: {
    type: 'loan',
    label: 'Loan',
    description: 'Compare payment, fees, payoff timing, and effective APR.',
    path: '/calculators/loan',
    defaultName: 'Loan Scenario',
    defaultData: defaultLoanCalculatorData,
    parseData: (value: unknown) => {
      const result = LoanCalculatorDataSchema.safeParse(value)
      return result.success ? result.data : defaultLoanCalculatorData
    },
  } satisfies CalculatorDefinition<LoanCalculatorData>,
  debtPayoff: {
    type: 'debtPayoff',
    label: 'Debt Payoff',
    description: 'See your payoff date, time saved, and interest saved.',
    path: '/calculators/debt-payoff',
    defaultName: 'Debt Payoff Scenario',
    defaultData: defaultDebtPayoffCalculatorData,
    parseData: (value: unknown) => {
      const result = DebtPayoffCalculatorDataSchema.safeParse(value)
      return result.success ? result.data : defaultDebtPayoffCalculatorData
    },
  } satisfies CalculatorDefinition<DebtPayoffCalculatorData>,
} as const

export const getCalculatorDefinition = (type: Calculator['calculatorType']) =>
  calculatorDefinitions[type]

