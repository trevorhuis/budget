const today = new Date()

export const getToday = () => today

export const toDateInputValue = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

