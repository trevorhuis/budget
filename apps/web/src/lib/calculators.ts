import { z } from 'zod'
import type { Calculator, JsonObject } from 'schemas'

const annualPmiRate = 0.005

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatCurrency = (value: number) => currencyFormatter.format(value)

export const formatPercent = (value: number, digits = 2) =>
  `${value.toFixed(digits)}%`

export const formatMonthYear = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)

const today = new Date()

export const toDateInputValue = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const computeMonthlyPayment = (
  principal: number,
  annualRatePercent: number,
  totalMonths: number
) => {
  if (totalMonths <= 0) {
    return 0
  }

  if (annualRatePercent === 0) {
    return principal / totalMonths
  }

  const monthlyRate = annualRatePercent / 100 / 12
  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -totalMonths))
  )
}

const solveApr = (payment: number, months: number, financedAmount: number) => {
  if (months <= 0 || financedAmount <= 0) {
    return 0
  }

  let low = 0
  let high = 1

  for (let index = 0; index < 80; index += 1) {
    const middle = (low + high) / 2
    const presentValue =
      middle === 0
        ? payment * months
        : (payment * (1 - Math.pow(1 + middle, -months))) / middle

    if (presentValue > financedAmount) {
      low = middle
    } else {
      high = middle
    }
  }

  return ((low + high) / 2) * 12 * 100
}

type MortgageCalculatorData = JsonObject & {
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

type LoanCalculatorData = JsonObject & {
  loanAmount: number
  termUnit: 'months' | 'years'
  termValue: number
  interestRate: number
  startDate: string
  originationFeeMode: 'amount' | 'percent'
  originationFeeValue: number
}

type DebtPayoffCalculatorData = JsonObject & {
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
  startDate: toDateInputValue(today),
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

export type AmortizationRow = {
  month: number
  label: string
  payment: number
  principal: number
  interest: number
  taxes: number
  insurance: number
  pmi: number
  totalPayment: number
  balance: number
  rate: number
}

export type MortgageCalculationResult = {
  downPaymentAmount: number
  loanAmount: number
  monthlyPayment: number
  monthlyPiti: number
  totalInterest: number
  amortizationSchedule: AmortizationRow[]
  amortizationTableRows: AmortizationRow[]
  monthlyBreakdown: Array<{ label: string; value: number; tone: string }>
  pmiApplied: boolean
}

export const calculateMortgage = (
  input: MortgageCalculatorData
): MortgageCalculationResult => {
  const downPaymentAmount =
    input.downPaymentMode === 'percent'
      ? input.homePrice * (input.downPaymentValue / 100)
      : input.downPaymentValue
  const normalizedDownPayment = Math.min(
    Math.max(downPaymentAmount, 0),
    input.homePrice
  )
  const loanAmount = Math.max(input.homePrice - normalizedDownPayment, 0)
  const totalMonths = input.loanTermYears * 12
  const monthlyTaxes = input.annualPropertyTaxes / 12
  const monthlyInsurance = input.annualHomeInsurance / 12
  const ltvThreshold = input.homePrice * 0.8
  let currentBalance = loanAmount
  let currentRate = input.interestRate
  let scheduledPayment = computeMonthlyPayment(
    loanAmount,
    currentRate,
    totalMonths
  )
  let totalInterest = 0

  const introMonths = input.adjustableRate.introFixedYears * 12
  const intervalMonths = input.adjustableRate.adjustmentIntervalYears * 12

  const schedule: AmortizationRow[] = []

  for (let month = 1; month <= totalMonths; month += 1) {
    const remainingMonths = totalMonths - month + 1
    const shouldAdjustRate =
      input.rateType === 'adjustable' &&
      month > introMonths &&
      (month - introMonths - 1) % intervalMonths === 0

    if (shouldAdjustRate) {
      currentRate = Math.min(
        currentRate + input.adjustableRate.rateAdjustment,
        input.adjustableRate.maxRate
      )
      scheduledPayment = computeMonthlyPayment(
        currentBalance,
        currentRate,
        remainingMonths
      )
    }

    const monthlyRate = currentRate / 100 / 12
    const interest = currentBalance * monthlyRate
    const principal = Math.min(
      currentBalance,
      Math.max(scheduledPayment - interest, 0)
    )
    const pmi =
      normalizedDownPayment < input.homePrice * 0.2 && currentBalance > ltvThreshold
        ? (currentBalance * annualPmiRate) / 12
        : 0

    currentBalance = Math.max(currentBalance - principal, 0)
    totalInterest += interest

    schedule.push({
      month,
      label: formatMonthYear(addMonths(today, month - 1)),
      payment: scheduledPayment,
      principal,
      interest,
      taxes: monthlyTaxes,
      insurance: monthlyInsurance,
      pmi,
      totalPayment: scheduledPayment + monthlyTaxes + monthlyInsurance + pmi,
      balance: currentBalance,
      rate: currentRate,
    })
  }

  const firstPayment = schedule[0] ?? {
    payment: 0,
    principal: 0,
    interest: 0,
    taxes: monthlyTaxes,
    insurance: monthlyInsurance,
    pmi: 0,
  }

  return {
    downPaymentAmount: normalizedDownPayment,
    loanAmount,
    monthlyPayment: firstPayment.payment,
    monthlyPiti: firstPayment.payment + monthlyTaxes + monthlyInsurance + firstPayment.pmi,
    totalInterest,
    amortizationSchedule: schedule,
    amortizationTableRows: schedule.filter(
      (row) => row.month === 1 || row.month % 12 === 0 || row.balance === 0
    ),
    monthlyBreakdown: [
      { label: 'Principal', value: firstPayment.principal, tone: 'bg-sky-500' },
      { label: 'Interest', value: firstPayment.interest, tone: 'bg-zinc-800' },
      { label: 'Taxes', value: monthlyTaxes, tone: 'bg-amber-500' },
      {
        label: firstPayment.pmi > 0 ? 'Insurance + PMI' : 'Insurance',
        value: monthlyInsurance + firstPayment.pmi,
        tone: 'bg-emerald-500',
      },
    ],
    pmiApplied: firstPayment.pmi > 0,
  }
}

export type LoanScheduleRow = {
  month: number
  label: string
  payment: number
  principal: number
  interest: number
  balance: number
}

export type LoanCalculationResult = {
  termMonths: number
  monthlyPayment: number
  totalInterest: number
  totalFees: number
  trueApr: number
  schedule: LoanScheduleRow[]
}

export const calculateLoan = (input: LoanCalculatorData): LoanCalculationResult => {
  const termMonths =
    input.termUnit === 'years'
      ? Math.max(Math.round(input.termValue * 12), 1)
      : Math.max(Math.round(input.termValue), 1)
  const monthlyPayment = computeMonthlyPayment(
    input.loanAmount,
    input.interestRate,
    termMonths
  )
  const totalFees =
    input.originationFeeMode === 'percent'
      ? input.loanAmount * (input.originationFeeValue / 100)
      : input.originationFeeValue

  let currentBalance = input.loanAmount
  let totalInterest = 0
  const startDate = new Date(input.startDate)
  const schedule: LoanScheduleRow[] = []

  for (let month = 1; month <= termMonths; month += 1) {
    const monthlyRate = input.interestRate / 100 / 12
    const interest = currentBalance * monthlyRate
    const principal = Math.min(
      currentBalance,
      Math.max(monthlyPayment - interest, 0)
    )

    currentBalance = Math.max(currentBalance - principal, 0)
    totalInterest += interest

    schedule.push({
      month,
      label: formatMonthYear(addMonths(startDate, month - 1)),
      payment: monthlyPayment,
      principal,
      interest,
      balance: currentBalance,
    })
  }

  const financedAmount = Math.max(input.loanAmount - totalFees, 0.01)

  return {
    termMonths,
    monthlyPayment,
    totalInterest,
    totalFees,
    trueApr: solveApr(monthlyPayment, termMonths, financedAmount),
    schedule,
  }
}

export type DebtPayoffResult = {
  acceleratedSchedule: LoanScheduleRow[] | null
  baselineSchedule: LoanScheduleRow[] | null
  acceleratedMonthlyPayment: number
  totalInterest: number
  payoffDateLabel: string
  interestSaved: number
  timeSavedMonths: number
  canPayOff: boolean
}

const buildDebtSchedule = (
  balance: number,
  apr: number,
  monthlyPayment: number
): LoanScheduleRow[] | null => {
  let currentBalance = balance
  const schedule: LoanScheduleRow[] = []

  for (let month = 1; month <= 600; month += 1) {
    if (currentBalance <= 0) {
      return schedule
    }

    const interest = currentBalance * (apr / 100 / 12)
    const principal = monthlyPayment - interest

    if (principal <= 0) {
      return null
    }

    const appliedPrincipal = Math.min(principal, currentBalance)
    const appliedPayment = appliedPrincipal + interest
    currentBalance = Math.max(currentBalance - appliedPrincipal, 0)

    schedule.push({
      month,
      label: formatMonthYear(addMonths(today, month - 1)),
      payment: appliedPayment,
      principal: appliedPrincipal,
      interest,
      balance: currentBalance,
    })
  }

  return null
}

export const calculateDebtPayoff = (
  input: DebtPayoffCalculatorData
): DebtPayoffResult => {
  const baselineSchedule = buildDebtSchedule(
    input.currentBalance,
    input.apr,
    input.currentMonthlyPayment
  )
  const acceleratedMonthlyPayment =
    input.currentMonthlyPayment + input.extraMonthlyPayment
  const acceleratedSchedule = buildDebtSchedule(
    input.currentBalance,
    input.apr,
    acceleratedMonthlyPayment
  )

  const canPayOff = acceleratedSchedule !== null
  const acceleratedInterest =
    acceleratedSchedule?.reduce((sum, row) => sum + row.interest, 0) ?? 0
  const baselineInterest =
    baselineSchedule?.reduce((sum, row) => sum + row.interest, 0) ?? 0
  const payoffDate =
    acceleratedSchedule && acceleratedSchedule.length > 0
      ? addMonths(today, acceleratedSchedule.length - 1)
      : today

  return {
    acceleratedSchedule,
    baselineSchedule,
    acceleratedMonthlyPayment,
    totalInterest: acceleratedInterest,
    payoffDateLabel: formatMonthYear(payoffDate),
    interestSaved: Math.max(baselineInterest - acceleratedInterest, 0),
    timeSavedMonths: Math.max(
      (baselineSchedule?.length ?? 0) - (acceleratedSchedule?.length ?? 0),
      0
    ),
    canPayOff,
  }
}

export const getCalculatorDefinition = (type: Calculator['calculatorType']) =>
  calculatorDefinitions[type]

export const getCalculatorSummary = (calculator: Calculator) => {
  switch (calculator.calculatorType) {
    case 'mortgage': {
      const result = calculateMortgage(
        calculatorDefinitions.mortgage.parseData(calculator.data)
      )
      return {
        monthlyPayment: result.monthlyPiti,
        totalInterest: result.totalInterest,
        helper: result.pmiApplied ? 'Includes PMI inside insurance.' : 'Fixed PITI snapshot.',
      }
    }
    case 'loan': {
      const result = calculateLoan(
        calculatorDefinitions.loan.parseData(calculator.data)
      )
      return {
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        helper: `True APR ${formatPercent(result.trueApr)} after fees.`,
      }
    }
    case 'debtPayoff': {
      const result = calculateDebtPayoff(
        calculatorDefinitions.debtPayoff.parseData(calculator.data)
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

export const buildShareUrl = (shareToken: string) => {
  if (typeof window === 'undefined') {
    return `/shared/calculators/${shareToken}`
  }

  return `${window.location.origin}/shared/calculators/${shareToken}`
}

export const copyToClipboard = async (value: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  if (typeof window !== 'undefined') {
    window.prompt('Copy this link', value)
  }
}

export const formatTimeSaved = (months: number) => {
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  }

  return `${years}y ${remainingMonths}m`
}

export type {
  MortgageCalculatorData,
  LoanCalculatorData,
  DebtPayoffCalculatorData,
}
