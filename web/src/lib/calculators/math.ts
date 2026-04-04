import { addMonths, getToday } from '~/lib/calculators/utils'
import { formatMonthYear } from '~/lib/calculators/format'
import type {
  DebtPayoffCalculatorData,
  LoanCalculatorData,
  MortgageCalculatorData,
} from '~/lib/calculators/definitions'

const annualPmiRate = 0.005

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
      label: formatMonthYear(addMonths(getToday(), month - 1)),
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
      label: formatMonthYear(addMonths(getToday(), month - 1)),
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
      ? addMonths(getToday(), acceleratedSchedule.length - 1)
      : getToday()

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

