import { normalizeDateFieldValue } from 'chronology/domain/parseDateFieldNumber'

type FieldName = 'year' | 'month' | 'day'

const yearAndDayBasePattern =
  /^(\d+|x|\d+\+|x\+\d+|\d+-\d+|\d+\/\d+|\d+[a-z]?|\(\d+\)|\[\d+\]|<\d+>|\d+[?!])$/i

export default function getDateFieldWarnings(
  field: FieldName,
  value: string,
): string[] {
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  const warnings: string[] = []

  if (field === 'year') {
    if (/<[^>]+>/.test(trimmed)) {
      warnings.push(
        'Year contains angle brackets. Use the Reconstructed switch instead.',
      )
    }
    if (trimmed.includes('!')) {
      warnings.push('Year contains !. Use the Emended switch instead.')
    }
  }

  if (/\[[^\]]+\]/.test(trimmed)) {
    warnings.push(
      'Value contains square brackets. Use the Broken switch instead.',
    )
  }
  if (trimmed.includes('?')) {
    warnings.push('Value contains ?. Use the Uncertain switch instead.')
  }

  {
    const normalized = normalizeDateFieldValue(trimmed)
    const hasRomanNumeral = /\b[ivxlcdm]+\b/i.test(normalized)
    const isStandardPattern = yearAndDayBasePattern.test(trimmed)
    const hasTextualFragment =
      /[a-z]/i.test(normalized) && !/^\d+[a-z]?$/i.test(normalized)

    if (hasRomanNumeral || hasTextualFragment || !isStandardPattern) {
      warnings.push(
        'Non-standard value may skip date conversion for this field.',
      )
    }
  }

  return [...new Set(warnings)]
}
