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

export const formatDateTime = (value?: Date) => {
  if (!value) {
    return 'Not saved yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
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

