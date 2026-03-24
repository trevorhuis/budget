import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  SparklesIcon,
  Squares2X2Icon,
  TrashIcon,
} from '@heroicons/react/20/solid'
import { useLiveQuery } from '@tanstack/react-db'
import { useRouterState } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import type { Calculator, JsonObject } from '../lib/schemas'

import { API } from '../lib/api'
import {
  buildShareUrl,
  calculatorDefinitions,
  calculateDebtPayoff,
  calculateLoan,
  calculateMortgage,
  copyToClipboard,
  type CalculatorDefinition,
  formatCurrency,
  formatPercent,
  formatTimeSaved,
  getCalculatorDefinition,
  getCalculatorSummary,
  type DebtPayoffCalculatorData,
  type LoanCalculatorData,
  type MortgageCalculatorData,
} from '../lib/calculators'
import {
  calculatorCollection,
  createCalculatorScenario,
  duplicateCalculatorScenario,
  shareCalculatorScenario,
} from '../lib/collections/calculatorCollection'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Field, FieldGroup, Fieldset, Label } from './ui/fieldset'
import { Heading, Subheading } from './ui/heading'
import { Input } from './ui/input'
import { Select } from './ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Text } from './ui/text'

const formatDateTime = (value?: Date) => {
  if (!value) {
    return 'Not saved yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

const readSearchParam = (searchStr: string, key: string) =>
  new URLSearchParams(searchStr).get(key)

function Surface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className={`rounded-[2rem] border border-zinc-950/8 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/4 ${className ?? ''}`}
    >
      {children}
    </motion.section>
  )
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-950/8 bg-zinc-950/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">
        {value}
      </div>
      {helper ? (
        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {helper}
        </div>
      ) : null}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.currentTarget.value || 0))}
      />
    </Field>
  )
}

function DonutChart({
  segments,
}: {
  segments: Array<{ label: string; value: number; tone: string }>
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
      <div className="relative mx-auto size-56">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            className="text-zinc-200 dark:text-white/10"
            fill="none"
          />
          {segments.map((segment) => {
            const strokeLength =
              total === 0 ? 0 : (segment.value / total) * circumference
            const currentOffset = offset
            offset += strokeLength

            return (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-currentOffset}
                className={segment.tone}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            First Month
          </div>
          <div className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center justify-between gap-4 border-b border-zinc-950/6 pb-3 text-sm last:border-b-0 dark:border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className={`size-3 rounded-full ${segment.tone}`} />
              <span className="font-medium text-zinc-950 dark:text-white">
                {segment.label}
              </span>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatCurrency(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildLinePath(values: number[]) {
  if (values.length === 0) {
    return ''
  }

  const width = 520
  const height = 220
  const max = Math.max(...values, 1)

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
      const y = height - (value / max) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function LineChart({
  title,
  series,
}: {
  title: string
  series: Array<{ label: string; color: string; values: number[] }>
}) {
  const max = Math.max(
    ...series.flatMap((entry) => entry.values),
    1
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Subheading>{title}</Subheading>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {series.map((entry) => (
            <span key={entry.label} className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${entry.color}`} />
              {entry.label}
            </span>
          ))}
        </div>
      </div>
      <svg
        viewBox="0 0 520 220"
        className="h-56 w-full rounded-2xl border border-zinc-950/8 bg-zinc-950/[0.025] p-3 dark:border-white/10 dark:bg-white/[0.04]"
      >
        <line
          x1="0"
          x2="520"
          y1="220"
          y2="220"
          stroke="currentColor"
          className="text-zinc-300 dark:text-white/15"
          strokeWidth="1"
        />
        <line
          x1="0"
          x2="520"
          y1="110"
          y2="110"
          stroke="currentColor"
          className="text-zinc-200 dark:text-white/10"
          strokeWidth="1"
        />
        {series.map((entry) => (
          <path
            key={entry.label}
            d={buildLinePath(entry.values)}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={entry.color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <text
          x="6"
          y="18"
          className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
        >
          {formatCurrency(max)}
        </text>
      </svg>
    </div>
  )
}

function ReadOnlyCalculatorReport({ calculator }: { calculator: Calculator }) {
  switch (calculator.calculatorType) {
    case 'mortgage': {
      const data = calculatorDefinitions.mortgage.parseData(calculator.data)
      const result = calculateMortgage(data)

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Monthly PITI" value={formatCurrency(result.monthlyPiti)} />
            <Metric label="Loan Amount" value={formatCurrency(result.loanAmount)} />
            <Metric label="Total Interest" value={formatCurrency(result.totalInterest)} />
          </div>
          <Surface>
            <DonutChart segments={result.monthlyBreakdown} />
          </Surface>
          <Surface>
            <Subheading>Amortization Snapshot</Subheading>
            <Table striped dense className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeader>Month</TableHeader>
                  <TableHeader>Rate</TableHeader>
                  <TableHeader>Total</TableHeader>
                  <TableHeader>Balance</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.amortizationTableRows.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>{formatPercent(row.rate)}</TableCell>
                    <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
                    <TableCell>{formatCurrency(row.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Surface>
        </div>
      )
    }
    case 'loan': {
      const data = calculatorDefinitions.loan.parseData(calculator.data)
      const result = calculateLoan(data)

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Monthly Payment" value={formatCurrency(result.monthlyPayment)} />
            <Metric label="True APR" value={formatPercent(result.trueApr)} />
            <Metric label="Origination Fees" value={formatCurrency(result.totalFees)} />
            <Metric label="Total Interest" value={formatCurrency(result.totalInterest)} />
          </div>
          <Surface>
            <LineChart
              title="Interest vs Principal"
              series={[
                {
                  label: 'Interest',
                  color: 'text-zinc-900 dark:text-zinc-100',
                  values: result.schedule.map((row) => row.interest),
                },
                {
                  label: 'Principal',
                  color: 'text-sky-500',
                  values: result.schedule.map((row) => row.principal),
                },
              ]}
            />
          </Surface>
        </div>
      )
    }
    case 'debtPayoff': {
      const data = calculatorDefinitions.debtPayoff.parseData(calculator.data)
      const result = calculateDebtPayoff(data)

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric
              label="Payoff Date"
              value={result.canPayOff ? result.payoffDateLabel : 'N/A'}
            />
            <Metric
              label="Interest Saved"
              value={formatCurrency(result.interestSaved)}
            />
            <Metric
              label="Time Saved"
              value={formatTimeSaved(result.timeSavedMonths)}
            />
            <Metric
              label="Monthly Payment"
              value={formatCurrency(result.acceleratedMonthlyPayment)}
            />
          </div>
          <Surface>
            <LineChart
              title="Balance Path"
              series={[
                {
                  label: 'Baseline',
                  color: 'text-zinc-900 dark:text-zinc-100',
                  values:
                    result.baselineSchedule?.map((row) => row.balance) ?? [0],
                },
                {
                  label: 'Accelerated',
                  color: 'text-emerald-500',
                  values:
                    result.acceleratedSchedule?.map((row) => row.balance) ?? [0],
                },
              ]}
            />
          </Surface>
        </div>
      )
    }
  }
}

function useScenarioDraft<TData extends JsonObject>(
  definition: CalculatorDefinition<TData>
) {
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  })
  const scenarioId = useMemo(
    () => readSearchParam(searchStr, 'scenarioId'),
    [searchStr]
  )
  const { data = [] } = useLiveQuery((q) => q.from({ calculator: calculatorCollection }))
  const scenarios = useMemo(
    () =>
      [...(data ?? [])]
        .filter((calculator) => calculator.calculatorType === definition.type)
        .sort(
          (left, right) =>
            (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0)
        ),
    [data, definition.type]
  )
  const activeScenario =
    scenarios.find((scenario) => scenario.id === scenarioId) ?? null
  const [name, setName] = useState(activeScenario?.name ?? definition.defaultName)
  const [draft, setDraft] = useState<TData>(() =>
    activeScenario ? definition.parseData(activeScenario.data) : definition.defaultData
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    setName(activeScenario?.name ?? definition.defaultName)
    setDraft(
      activeScenario
        ? definition.parseData(activeScenario.data)
        : definition.defaultData
    )
    setFeedback(null)
  }, [activeScenario?.id, activeScenario?.updatedAt, definition])

  const openScenario = (id: string) => {
    window.location.assign(`${definition.path}?scenarioId=${id}`)
  }

  const saveScenario = async () => {
    const trimmedName = name.trim() || definition.defaultName
    setIsWorking(true)
    setFeedback(null)

    try {
      if (activeScenario) {
        await Promise.resolve(
          calculatorCollection.update(activeScenario.id, (storedScenario) => {
            storedScenario.name = trimmedName
            storedScenario.calculatorType = definition.type
            storedScenario.data = draft
          })
        )
        setFeedback('Scenario updated.')
      } else {
        const newId = await createCalculatorScenario({
          calculatorType: definition.type,
          data: draft,
          name: trimmedName,
        })
        openScenario(newId)
      }
    } catch {
      setFeedback('Unable to save this scenario right now.')
    } finally {
      setIsWorking(false)
    }
  }

  const duplicateScenario = async () => {
    if (!activeScenario) {
      setFeedback('Save the scenario before duplicating it.')
      return
    }

    setIsWorking(true)
    setFeedback(null)

    try {
      const duplicated = await duplicateCalculatorScenario(activeScenario.id)
      openScenario(duplicated.id)
    } catch {
      setFeedback('Unable to duplicate this scenario.')
    } finally {
      setIsWorking(false)
    }
  }

  const shareScenario = async () => {
    if (!activeScenario) {
      setFeedback('Save the scenario before creating a share link.')
      return
    }

    setIsWorking(true)
    setFeedback(null)

    try {
      const shareToken =
        activeScenario.shareToken ?? (await shareCalculatorScenario(activeScenario.id))
      await copyToClipboard(buildShareUrl(shareToken))
      setFeedback('Share link copied.')
    } catch {
      setFeedback('Unable to create a share link.')
    } finally {
      setIsWorking(false)
    }
  }

  const openPdf = async () => {
    if (!activeScenario) {
      setFeedback('Save the scenario before exporting it.')
      return
    }

    setIsWorking(true)
    setFeedback(null)

    try {
      const shareToken =
        activeScenario.shareToken ?? (await shareCalculatorScenario(activeScenario.id))
      window.open(`${buildShareUrl(shareToken)}?print=1`, '_blank', 'noopener,noreferrer')
    } catch {
      setFeedback('Unable to open the printable report.')
    } finally {
      setIsWorking(false)
    }
  }

  const removeScenario = async () => {
    if (!activeScenario) {
      return
    }

    setIsWorking(true)
    setFeedback(null)

    try {
      await Promise.resolve(calculatorCollection.delete(activeScenario.id))
      window.location.assign(definition.path)
    } catch {
      setFeedback('Unable to delete this scenario.')
      setIsWorking(false)
    }
  }

  return {
    activeScenario,
    draft,
    feedback,
    isWorking,
    name,
    openPdf,
    openScenario,
    removeScenario,
    saveScenario,
    scenarios,
    setDraft,
    setFeedback,
    setName,
    shareScenario,
    duplicateScenario,
  }
}

function ScenarioShell<TData extends JsonObject>({
  children,
  definition,
  scenario,
}: {
  children: ReactNode
  definition: CalculatorDefinition<TData>
  scenario: ReturnType<typeof useScenarioDraft<TData>>
}) {
  return (
    <div className="space-y-8">
      <Surface className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(244,244,245,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_34%),linear-gradient(135deg,_rgba(24,24,27,0.94),_rgba(9,9,11,0.92))]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="sky">{definition.label}</Badge>
              {scenario.activeScenario ? (
                <Badge color="emerald">Saved</Badge>
              ) : (
                <Badge color="amber">Draft</Badge>
              )}
            </div>
            <Heading className="mt-4">{definition.label} Calculator</Heading>
            <Text className="mt-2 max-w-2xl">
              {definition.description}
            </Text>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 xl:text-right">
            <div>Last Modified</div>
            <div className="mt-1 font-medium text-zinc-950 dark:text-white">
              {formatDateTime(scenario.activeScenario?.updatedAt)}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <Field>
            <Label>Scenario Name</Label>
            <Input
              value={scenario.name}
              onChange={(event) => scenario.setName(event.currentTarget.value)}
              placeholder={definition.defaultName}
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button onClick={scenario.saveScenario} disabled={scenario.isWorking}>
              <Squares2X2Icon />
              {scenario.activeScenario ? 'Update Scenario' : 'Save Scenario'}
            </Button>
            <Button plain onClick={scenario.duplicateScenario} disabled={scenario.isWorking}>
              <ArrowPathRoundedSquareIcon />
              Duplicate
            </Button>
            <Button plain onClick={scenario.shareScenario} disabled={scenario.isWorking}>
              <LinkIcon />
              Share Link
            </Button>
            <Button plain onClick={scenario.openPdf} disabled={scenario.isWorking}>
              <DocumentArrowDownIcon />
              Generate PDF
            </Button>
            {scenario.activeScenario ? (
              <Button plain onClick={scenario.removeScenario} disabled={scenario.isWorking}>
                <TrashIcon />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
        {scenario.feedback ? (
          <div className="mt-4 rounded-2xl border border-zinc-950/8 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            {scenario.feedback}
          </div>
        ) : null}
      </Surface>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        {children}
      </div>
      <Surface>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Subheading>Recent {definition.label} Scenarios</Subheading>
            <Text className="mt-1">
              Jump between saved what-if cases without leaving this calculator.
            </Text>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {scenario.scenarios.length > 0 ? (
            scenario.scenarios.slice(0, 5).map((savedScenario) => (
              <button
                key={savedScenario.id}
                type="button"
                onClick={() => scenario.openScenario(savedScenario.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  savedScenario.id === scenario.activeScenario?.id
                    ? 'border-sky-500/50 bg-sky-500/8'
                    : 'border-zinc-950/8 hover:bg-zinc-950/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {savedScenario.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(savedScenario.updatedAt)}
                  </div>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(getCalculatorSummary(savedScenario).monthlyPayment)}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-950/12 px-4 py-5 text-sm text-zinc-500 dark:border-white/12 dark:text-zinc-400">
              Save your first scenario to build a library of comparisons.
            </div>
          )}
        </div>
      </Surface>
    </div>
  )
}

export function MortgageCalculatorWorkspace() {
  const scenario = useScenarioDraft(calculatorDefinitions.mortgage)
  const result = useMemo(
    () => calculateMortgage(scenario.draft as MortgageCalculatorData),
    [scenario.draft]
  )

  return (
    <ScenarioShell definition={calculatorDefinitions.mortgage} scenario={scenario}>
      <Surface>
        <Subheading>Inputs</Subheading>
        <Fieldset className="mt-5">
          <FieldGroup>
            <NumberField
              label="Home Purchase Price"
              value={scenario.draft.homePrice}
              min={0}
              step={1000}
              onChange={(value) =>
                scenario.setDraft((current) => ({ ...current, homePrice: value }))
              }
            />
            <Field>
              <Label>Down Payment Mode</Label>
              <Select
                value={scenario.draft.downPaymentMode}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    downPaymentMode: event.currentTarget.value as MortgageCalculatorData['downPaymentMode'],
                  }))
                }
              >
                <option value="percent">Percent</option>
                <option value="amount">Dollar Amount</option>
              </Select>
            </Field>
            <NumberField
              label={scenario.draft.downPaymentMode === 'percent' ? 'Down Payment %' : 'Down Payment $'}
              value={scenario.draft.downPaymentValue}
              min={0}
              step={scenario.draft.downPaymentMode === 'percent' ? 0.5 : 1000}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  downPaymentValue: value,
                }))
              }
            />
            <Field>
              <Label>Interest Mode</Label>
              <Select
                value={scenario.draft.rateType}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    rateType: event.currentTarget.value as MortgageCalculatorData['rateType'],
                  }))
                }
              >
                <option value="fixed">Fixed</option>
                <option value="adjustable">Simple ARM</option>
              </Select>
            </Field>
            <NumberField
              label="Initial Interest Rate"
              value={scenario.draft.interestRate}
              min={0}
              step={0.05}
              onChange={(value) =>
                scenario.setDraft((current) => ({ ...current, interestRate: value }))
              }
            />
            <Field>
              <Label>Loan Term</Label>
              <Select
                value={`${scenario.draft.loanTermYears}`}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    loanTermYears: Number(event.currentTarget.value) as MortgageCalculatorData['loanTermYears'],
                  }))
                }
              >
                {[10, 15, 20, 30].map((years) => (
                  <option key={years} value={years}>
                    {years} years
                  </option>
                ))}
              </Select>
            </Field>
            <NumberField
              label="Annual Property Taxes"
              value={scenario.draft.annualPropertyTaxes}
              min={0}
              step={100}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  annualPropertyTaxes: value,
                }))
              }
            />
            <NumberField
              label="Annual Homeowners Insurance"
              value={scenario.draft.annualHomeInsurance}
              min={0}
              step={100}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  annualHomeInsurance: value,
                }))
              }
            />
            {scenario.draft.rateType === 'adjustable' ? (
              <>
                <NumberField
                  label="Intro Fixed Years"
                  value={scenario.draft.adjustableRate.introFixedYears}
                  min={1}
                  step={1}
                  onChange={(value) =>
                    scenario.setDraft((current) => ({
                      ...current,
                      adjustableRate: {
                        ...current.adjustableRate,
                        introFixedYears: value,
                      },
                    }))
                  }
                />
                <NumberField
                  label="Adjustment Interval (Years)"
                  value={scenario.draft.adjustableRate.adjustmentIntervalYears}
                  min={1}
                  step={1}
                  onChange={(value) =>
                    scenario.setDraft((current) => ({
                      ...current,
                      adjustableRate: {
                        ...current.adjustableRate,
                        adjustmentIntervalYears: value,
                      },
                    }))
                  }
                />
                <NumberField
                  label="Rate Increase Per Reset"
                  value={scenario.draft.adjustableRate.rateAdjustment}
                  min={0}
                  step={0.25}
                  onChange={(value) =>
                    scenario.setDraft((current) => ({
                      ...current,
                      adjustableRate: {
                        ...current.adjustableRate,
                        rateAdjustment: value,
                      },
                    }))
                  }
                />
                <NumberField
                  label="Maximum Rate"
                  value={scenario.draft.adjustableRate.maxRate}
                  min={0}
                  step={0.25}
                  onChange={(value) =>
                    scenario.setDraft((current) => ({
                      ...current,
                      adjustableRate: {
                        ...current.adjustableRate,
                        maxRate: value,
                      },
                    }))
                  }
                />
              </>
            ) : null}
          </FieldGroup>
        </Fieldset>
      </Surface>
      <div className="space-y-6">
        <Surface>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric
              label="Monthly PITI"
              value={formatCurrency(result.monthlyPiti)}
              helper={result.pmiApplied ? 'PMI is active until the loan reaches 80% LTV.' : 'PMI is not required.'}
            />
            <Metric
              label="Down Payment"
              value={formatCurrency(result.downPaymentAmount)}
              helper={formatPercent(
                scenario.draft.homePrice === 0
                  ? 0
                  : (result.downPaymentAmount / scenario.draft.homePrice) * 100
              )}
            />
            <Metric
              label="Sticker Shock"
              value={formatCurrency(result.totalInterest)}
              helper="Total interest across the full loan life."
            />
          </div>
        </Surface>
        <Surface>
          <DonutChart segments={result.monthlyBreakdown} />
        </Surface>
        <Surface>
          <Subheading>Amortization Schedule</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Month</TableHeader>
                <TableHeader>Rate</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Interest</TableHeader>
                <TableHeader>Total Payment</TableHeader>
                <TableHeader>Balance</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.amortizationTableRows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{formatPercent(row.rate)}</TableCell>
                  <TableCell>{formatCurrency(row.principal)}</TableCell>
                  <TableCell>{formatCurrency(row.interest)}</TableCell>
                  <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
                  <TableCell>{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Surface>
      </div>
    </ScenarioShell>
  )
}

export function LoanCalculatorWorkspace() {
  const scenario = useScenarioDraft(calculatorDefinitions.loan)
  const result = useMemo(
    () => calculateLoan(scenario.draft as LoanCalculatorData),
    [scenario.draft]
  )

  return (
    <ScenarioShell definition={calculatorDefinitions.loan} scenario={scenario}>
      <Surface>
        <Subheading>Inputs</Subheading>
        <Fieldset className="mt-5">
          <FieldGroup>
            <NumberField
              label="Total Loan Amount"
              value={scenario.draft.loanAmount}
              min={0}
              step={500}
              onChange={(value) =>
                scenario.setDraft((current) => ({ ...current, loanAmount: value }))
              }
            />
            <Field>
              <Label>Loan Term Unit</Label>
              <Select
                value={scenario.draft.termUnit}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    termUnit: event.currentTarget.value as LoanCalculatorData['termUnit'],
                  }))
                }
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </Select>
            </Field>
            <NumberField
              label="Loan Term Value"
              value={scenario.draft.termValue}
              min={1}
              step={1}
              onChange={(value) =>
                scenario.setDraft((current) => ({ ...current, termValue: value }))
              }
            />
            <NumberField
              label="Interest Rate"
              value={scenario.draft.interestRate}
              min={0}
              step={0.05}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  interestRate: value,
                }))
              }
            />
            <Field>
              <Label>Loan Start Date</Label>
              <Input
                type="date"
                value={scenario.draft.startDate}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    startDate: event.currentTarget.value,
                  }))
                }
              />
            </Field>
            <Field>
              <Label>Origination Fee Mode</Label>
              <Select
                value={scenario.draft.originationFeeMode}
                onChange={(event) =>
                  scenario.setDraft((current) => ({
                    ...current,
                    originationFeeMode: event.currentTarget.value as LoanCalculatorData['originationFeeMode'],
                  }))
                }
              >
                <option value="percent">Percent</option>
                <option value="amount">Dollar Amount</option>
              </Select>
            </Field>
            <NumberField
              label={scenario.draft.originationFeeMode === 'percent' ? 'Origination Fee %' : 'Origination Fee $'}
              value={scenario.draft.originationFeeValue}
              min={0}
              step={scenario.draft.originationFeeMode === 'percent' ? 0.1 : 50}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  originationFeeValue: value,
                }))
              }
            />
          </FieldGroup>
        </Fieldset>
      </Surface>
      <div className="space-y-6">
        <Surface>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric
              label="Monthly Payment"
              value={formatCurrency(result.monthlyPayment)}
            />
            <Metric label="Total Interest" value={formatCurrency(result.totalInterest)} />
            <Metric label="True APR" value={formatPercent(result.trueApr)} />
            <Metric label="Upfront Fees" value={formatCurrency(result.totalFees)} />
          </div>
        </Surface>
        <Surface>
          <LineChart
            title="Interest vs Principal"
            series={[
              {
                label: 'Interest',
                color: 'text-zinc-900 dark:text-zinc-100',
                values: result.schedule.map((row) => row.interest),
              },
              {
                label: 'Principal',
                color: 'text-sky-500',
                values: result.schedule.map((row) => row.principal),
              },
            ]}
          />
        </Surface>
        <Surface>
          <Subheading>Payment Summary</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Month</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Interest</TableHeader>
                <TableHeader>Balance</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.schedule.slice(0, 24).map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{formatCurrency(row.payment)}</TableCell>
                  <TableCell>{formatCurrency(row.principal)}</TableCell>
                  <TableCell>{formatCurrency(row.interest)}</TableCell>
                  <TableCell>{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Surface>
      </div>
    </ScenarioShell>
  )
}

export function DebtPayoffCalculatorWorkspace() {
  const scenario = useScenarioDraft(calculatorDefinitions.debtPayoff)
  const result = useMemo(
    () => calculateDebtPayoff(scenario.draft as DebtPayoffCalculatorData),
    [scenario.draft]
  )

  return (
    <ScenarioShell definition={calculatorDefinitions.debtPayoff} scenario={scenario}>
      <Surface>
        <Subheading>Inputs</Subheading>
        <Fieldset className="mt-5">
          <FieldGroup>
            <NumberField
              label="Current Balance"
              value={scenario.draft.currentBalance}
              min={0}
              step={100}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  currentBalance: value,
                }))
              }
            />
            <NumberField
              label="APR"
              value={scenario.draft.apr}
              min={0}
              step={0.1}
              onChange={(value) =>
                scenario.setDraft((current) => ({ ...current, apr: value }))
              }
            />
            <NumberField
              label="Current Monthly Payment"
              value={scenario.draft.currentMonthlyPayment}
              min={0}
              step={10}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  currentMonthlyPayment: value,
                }))
              }
            />
            <NumberField
              label="Accelerator Extra Payment"
              value={scenario.draft.extraMonthlyPayment}
              min={0}
              step={10}
              onChange={(value) =>
                scenario.setDraft((current) => ({
                  ...current,
                  extraMonthlyPayment: value,
                }))
              }
            />
          </FieldGroup>
        </Fieldset>
      </Surface>
      <div className="space-y-6">
        <Surface>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric
              label="Payoff Date"
              value={result.canPayOff ? result.payoffDateLabel : 'Never'}
              helper={
                result.canPayOff
                  ? 'Estimated from the current calendar month.'
                  : 'Increase your payment to outrun monthly interest.'
              }
            />
            <Metric
              label="Interest Saved"
              value={formatCurrency(result.interestSaved)}
            />
            <Metric
              label="Time Saved"
              value={formatTimeSaved(result.timeSavedMonths)}
            />
            <Metric
              label="Accelerated Payment"
              value={formatCurrency(result.acceleratedMonthlyPayment)}
            />
          </div>
        </Surface>
        <Surface>
          <LineChart
            title="Balance Path"
            series={[
              {
                label: 'Baseline',
                color: 'text-zinc-900 dark:text-zinc-100',
                values: result.baselineSchedule?.map((row) => row.balance) ?? [0],
              },
              {
                label: 'Accelerated',
                color: 'text-emerald-500',
                values: result.acceleratedSchedule?.map((row) => row.balance) ?? [0],
              },
            ]}
          />
        </Surface>
        <Surface>
          <Subheading>Timeline Comparison</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Scenario</TableHeader>
                <TableHeader>Months</TableHeader>
                <TableHeader>Total Interest</TableHeader>
                <TableHeader>Monthly Payment</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Baseline</TableCell>
                <TableCell>{result.baselineSchedule?.length ?? 'N/A'}</TableCell>
                <TableCell>
                  {formatCurrency(
                    result.baselineSchedule?.reduce(
                      (sum, row) => sum + row.interest,
                      0
                    ) ?? 0
                  )}
                </TableCell>
                <TableCell>{formatCurrency(scenario.draft.currentMonthlyPayment)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Accelerated</TableCell>
                <TableCell>{result.acceleratedSchedule?.length ?? 'N/A'}</TableCell>
                <TableCell>{formatCurrency(result.totalInterest)}</TableCell>
                <TableCell>{formatCurrency(result.acceleratedMonthlyPayment)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Surface>
      </div>
    </ScenarioShell>
  )
}

export function CalculatorDashboard() {
  const { data = [] } = useLiveQuery((q) => q.from({ calculator: calculatorCollection }))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState<string | null>(null)
  const calculators = useMemo(
    () =>
      [...(data ?? [])].sort(
        (left, right) =>
          (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0)
      ),
    [data]
  )

  const toggleSelection = (calculatorId: string) => {
    setSelectedIds((current) => {
      if (current.includes(calculatorId)) {
        return current.filter((id) => id !== calculatorId)
      }

      return [...current.slice(-1), calculatorId]
    })
  }

  const handleDuplicate = async (calculator: Calculator) => {
    setIsWorking(calculator.id)
    setFeedback(null)

    try {
      const duplicated = await duplicateCalculatorScenario(calculator.id)
      const definition = getCalculatorDefinition(duplicated.calculatorType)
      window.location.assign(`${definition.path}?scenarioId=${duplicated.id}`)
    } catch {
      setFeedback('Unable to duplicate this scenario.')
    } finally {
      setIsWorking(null)
    }
  }

  const handleShare = async (calculator: Calculator) => {
    setIsWorking(calculator.id)
    setFeedback(null)

    try {
      const shareToken =
        calculator.shareToken ?? (await shareCalculatorScenario(calculator.id))
      await copyToClipboard(buildShareUrl(shareToken))
      setFeedback('Share link copied.')
    } catch {
      setFeedback('Unable to create a share link.')
    } finally {
      setIsWorking(null)
    }
  }

  const handlePdf = async (calculator: Calculator) => {
    setIsWorking(calculator.id)
    setFeedback(null)

    try {
      const shareToken =
        calculator.shareToken ?? (await shareCalculatorScenario(calculator.id))
      window.open(`${buildShareUrl(shareToken)}?print=1`, '_blank', 'noopener,noreferrer')
    } catch {
      setFeedback('Unable to open the printable report.')
    } finally {
      setIsWorking(null)
    }
  }

  return (
    <div className="space-y-8">
      <Surface className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(244,244,245,0.95))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,_rgba(24,24,27,0.94),_rgba(9,9,11,0.92))]">
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="emerald">Saved Scenarios</Badge>
          <Badge color="sky">{calculators.length} total</Badge>
        </div>
        <Heading className="mt-4">Scenario Library</Heading>
        <Text className="mt-2 max-w-2xl">
          Name each model, duplicate it for what-if branches, then compare two saved
          scenarios side by side before you commit.
        </Text>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/calculators/mortgage">
            <SparklesIcon />
            New Mortgage Scenario
          </Button>
          <Button color="white" href="/calculators/loan">
            <Squares2X2Icon />
            New Loan Scenario
          </Button>
          <Button color="white" href="/calculators/debt-payoff">
            <ArrowPathRoundedSquareIcon />
            New Debt Scenario
          </Button>
          <Button
            plain
            onClick={() => {
              if (selectedIds.length === 2) {
                window.location.assign(
                  `/calculators/compare?left=${selectedIds[0]}&right=${selectedIds[1]}`
                )
              }
            }}
            disabled={selectedIds.length !== 2}
          >
            <ArrowsRightLeftIcon />
            Compare Selected
          </Button>
        </div>
        {feedback ? (
          <div className="mt-4 rounded-2xl border border-zinc-950/8 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            {feedback}
          </div>
        ) : null}
      </Surface>
      <Surface>
        <Table striped className="mt-2">
          <TableHead>
            <TableRow>
              <TableHeader>Compare</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Monthly</TableHeader>
              <TableHeader>Total Interest</TableHeader>
              <TableHeader>Last Modified</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {calculators.map((calculator) => {
              const definition = getCalculatorDefinition(calculator.calculatorType)
              const summary = getCalculatorSummary(calculator)

              return (
                <TableRow key={calculator.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(calculator.id)}
                      onChange={() => toggleSelection(calculator.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        window.location.assign(
                          `${definition.path}?scenarioId=${calculator.id}`
                        )
                      }
                      className="text-left font-medium text-zinc-950 hover:text-sky-600 dark:text-white dark:hover:text-sky-400"
                    >
                      {calculator.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge color="sky">{definition.label}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(summary.monthlyPayment)}</TableCell>
                  <TableCell>{formatCurrency(summary.totalInterest)}</TableCell>
                  <TableCell>{formatDateTime(calculator.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        plain
                        onClick={() =>
                          window.location.assign(
                            `${definition.path}?scenarioId=${calculator.id}`
                          )
                        }
                      >
                        Open
                      </Button>
                      <Button
                        plain
                        onClick={() => handleDuplicate(calculator)}
                        disabled={isWorking === calculator.id}
                      >
                        Duplicate
                      </Button>
                      <Button
                        plain
                        onClick={() => handleShare(calculator)}
                        disabled={isWorking === calculator.id}
                      >
                        Share
                      </Button>
                      <Button
                        plain
                        onClick={() => handlePdf(calculator)}
                        disabled={isWorking === calculator.id}
                      >
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Surface>
    </div>
  )
}

export function CalculatorCompareWorkspace() {
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  })
  const leftId = readSearchParam(searchStr, 'left')
  const rightId = readSearchParam(searchStr, 'right')
  const { data = [] } = useLiveQuery((q) => q.from({ calculator: calculatorCollection }))
  const calculators = data ?? []
  const leftScenario = calculators.find((calculator) => calculator.id === leftId) ?? null
  const rightScenario =
    calculators.find((calculator) => calculator.id === rightId) ?? null

  if (!leftScenario || !rightScenario) {
    return (
      <div className="space-y-8">
        <Surface>
          <Badge color="amber">Compare</Badge>
          <Heading className="mt-4">Pick Two Saved Scenarios</Heading>
          <Text className="mt-2">
            Select two scenarios from your saved dashboard, then launch compare mode
            from there.
          </Text>
          <div className="mt-6">
            <Button href="/calculators">Open Saved Scenarios</Button>
          </div>
        </Surface>
      </div>
    )
  }

  if (leftScenario.calculatorType !== rightScenario.calculatorType) {
    return (
      <div className="space-y-8">
        <Surface>
          <Badge color="rose">Type Mismatch</Badge>
          <Heading className="mt-4">Use Matching Calculator Types</Heading>
          <Text className="mt-2">
            Comparison mode only works for two saved scenarios from the same
            calculator family.
          </Text>
          <div className="mt-6">
            <Button href="/calculators">Back to Saved Scenarios</Button>
          </div>
        </Surface>
      </div>
    )
  }

  const leftSummary = getCalculatorSummary(leftScenario)
  const rightSummary = getCalculatorSummary(rightScenario)
  const definition = getCalculatorDefinition(leftScenario.calculatorType)
  const monthlyDelta = rightSummary.monthlyPayment - leftSummary.monthlyPayment
  const interestDelta = rightSummary.totalInterest - leftSummary.totalInterest

  return (
    <div className="space-y-8">
      <Surface>
        <Badge color="sky">Comparison</Badge>
        <Heading className="mt-4">{definition.label} Comparison View</Heading>
        <Text className="mt-2">
          Compare monthly cash flow and lifetime interest before you decide which
          scenario to keep.
        </Text>
      </Surface>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
        <Surface>
          <Subheading>{leftScenario.name}</Subheading>
          <div className="mt-5 grid gap-4">
            <Metric label="Monthly" value={formatCurrency(leftSummary.monthlyPayment)} />
            <Metric label="Total Interest" value={formatCurrency(leftSummary.totalInterest)} />
            <Metric label="Last Modified" value={formatDateTime(leftScenario.updatedAt)} />
          </div>
        </Surface>
        <Surface className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Subheading className="text-white dark:text-zinc-950">Delta</Subheading>
          <div className="mt-5 grid gap-4">
            <Metric
              label="Monthly Difference"
              value={formatCurrency(monthlyDelta)}
              helper={monthlyDelta < 0 ? 'Right scenario is cheaper monthly.' : 'Right scenario costs more monthly.'}
            />
            <Metric
              label="Interest Difference"
              value={formatCurrency(interestDelta)}
              helper={interestDelta < 0 ? 'Right scenario pays less interest.' : 'Right scenario pays more interest.'}
            />
          </div>
        </Surface>
        <Surface>
          <Subheading>{rightScenario.name}</Subheading>
          <div className="mt-5 grid gap-4">
            <Metric label="Monthly" value={formatCurrency(rightSummary.monthlyPayment)} />
            <Metric label="Total Interest" value={formatCurrency(rightSummary.totalInterest)} />
            <Metric label="Last Modified" value={formatDateTime(rightScenario.updatedAt)} />
          </div>
        </Surface>
      </div>
    </div>
  )
}

export function SharedCalculatorReport({ shareToken }: { shareToken: string }) {
  const [calculator, setCalculator] = useState<Calculator | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    API.calculators
      .fetchShared(shareToken)
      .then((response) => {
        if (!active) {
          return
        }

        setCalculator({
          ...response.data,
          shareToken: response.data.shareToken ?? null,
          createdAt: response.data.createdAt
            ? new Date(response.data.createdAt)
            : undefined,
          updatedAt: response.data.updatedAt
            ? new Date(response.data.updatedAt)
            : undefined,
        })
      })
      .catch(() => {
        if (active) {
          setError('This shared scenario is unavailable.')
        }
      })

    return () => {
      active = false
    }
  }, [shareToken])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)

    if (params.get('print') === '1' && calculator) {
      window.setTimeout(() => window.print(), 200)
    }
  }, [calculator])

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Surface>
          <Badge color="rose">Unavailable</Badge>
          <Heading className="mt-4">Shared Scenario Missing</Heading>
          <Text className="mt-2">{error}</Text>
        </Surface>
      </div>
    )
  }

  if (!calculator) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Surface>
          <Badge color="sky">Loading</Badge>
          <Heading className="mt-4">Preparing Shared Report</Heading>
        </Surface>
      </div>
    )
  }

  const definition = getCalculatorDefinition(calculator.calculatorType)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Surface>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="sky">{definition.label}</Badge>
          <Badge color="emerald">Shared</Badge>
        </div>
        <Heading className="mt-4">{calculator.name}</Heading>
        <Text className="mt-2">
          Read-only scenario report generated from a saved calculator session.
        </Text>
        <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Last modified {formatDateTime(calculator.updatedAt)}
        </div>
      </Surface>
      <div className="mt-8">
        <ReadOnlyCalculatorReport calculator={calculator} />
      </div>
    </div>
  )
}
