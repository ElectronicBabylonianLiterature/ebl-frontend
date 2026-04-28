type FieldName = 'year' | 'month' | 'day'

const STANDARD_DATE_FIELD_PATTERN =
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

  if (field !== 'month' && isNonStandardValue(trimmed)) {
    warnings.push('Non-standard value may skip date conversion for this field.')
  }

  return [...new Set(warnings)]
}

function isNonStandardValue(trimmed: string): boolean {
  return !STANDARD_DATE_FIELD_PATTERN.test(trimmed)
}
