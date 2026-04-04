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

