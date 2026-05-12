const APPROXIMATE_PATTERNS = [/^\d+\+$/, /^x\+\d+$/i, /^\d+\/\d+$/, /^\d+-\d+$/]

export function isApproximateDateFieldValue(value: string): boolean {
  return APPROXIMATE_PATTERNS.some((pattern) => pattern.test(value.trim()))
}

export function normalizeDateFieldValue(value: string): string {
  let normalized = value.trim()

  normalized = normalized.replace(/[?!]+$/g, '')
  normalized = normalized.replace(/^<\s*([^<>]+)\s*>$/g, '$1')
  normalized = normalized.replace(/^\[\s*([^\]]+)\s*\]$/g, '$1')
  normalized = normalized.replace(/^\(\s*([^()]+)\s*\)$/g, '$1')

  if (/^x\+\d+$/i.test(normalized)) {
    normalized = normalized.split('+')[1]
  }

  return normalized
}

export default function parseDateFieldNumber(value: string): number {
  const normalized = normalizeDateFieldValue(value)
  return parseInt(normalized, 10)
}
