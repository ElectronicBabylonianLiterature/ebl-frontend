import getDateFieldWarnings from 'chronology/ui/DateEditor/dateFieldWarnings'

it('warns for square brackets in any field', () => {
  expect(getDateFieldWarnings('month', '[12]')).toContain(
    'Value contains square brackets. Use the Broken switch instead.',
  )
  expect(getDateFieldWarnings('day', '[5]')).toContain(
    'Value contains square brackets. Use the Broken switch instead.',
  )
})

it('warns for ? in any field', () => {
  expect(getDateFieldWarnings('year', '12?')).toContain(
    'Value contains ?. Use the Uncertain switch instead.',
  )
  expect(getDateFieldWarnings('month', '5?')).toContain(
    'Value contains ?. Use the Uncertain switch instead.',
  )
  expect(getDateFieldWarnings('day', '3?')).toContain(
    'Value contains ?. Use the Uncertain switch instead.',
  )
})

it('warns for ! in year field', () => {
  expect(getDateFieldWarnings('year', '1!')).toContain(
    'Year contains !. Use the Emended switch instead.',
  )
})

it('1! is allowed in month and day; no warning', () => {
  expect(getDateFieldWarnings('month', '1!')).toHaveLength(0)
  expect(getDateFieldWarnings('day', '1!')).toHaveLength(0)
})

it('warns for multiple ! as both emended and non-standard', () => {
  expect(getDateFieldWarnings('year', '1!!!!!')).toContain(
    'Year contains !. Use the Emended switch instead.',
  )
  expect(getDateFieldWarnings('year', '1!!!!!')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('month', '1!!!!!')).not.toContain(
    'Value contains !. Use the Emended switch instead.',
  )
  expect(getDateFieldWarnings('month', '1!!!!!')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('day', '1!!!!!')).not.toContain(
    'Value contains !. Use the Emended switch instead.',
  )
  expect(getDateFieldWarnings('day', '1!!!!!')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
})

it('warns for non-standard values', () => {
  expect(getDateFieldWarnings('year', 'foo')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('month', 'XIV')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('month', '21%$')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('day', '12abc')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
  expect(getDateFieldWarnings('day', 'XIV')).toContain(
    'Non-standard value may skip date conversion for this field.',
  )
})

it.each(['21%$', '12@', '5#3', '!@#', '12.5', '1 2'])(
  'warns for value with non-pattern characters: %s',
  (value) => {
    expect(getDateFieldWarnings('year', value)).toContain(
      'Non-standard value may skip date conversion for this field.',
    )
    expect(getDateFieldWarnings('month', value)).toContain(
      'Non-standard value may skip date conversion for this field.',
    )
    expect(getDateFieldWarnings('day', value)).toContain(
      'Non-standard value may skip date conversion for this field.',
    )
  },
)

it('returns no warnings for allowed patterns', () => {
  const allowed = ['12', '1-10', '0', '1/2', '12+', 'x', 'x+5', '12a']
  allowed.forEach((val) => {
    expect(getDateFieldWarnings('year', val)).toHaveLength(0)
    expect(getDateFieldWarnings('month', val)).toHaveLength(0)
    expect(getDateFieldWarnings('day', val)).toHaveLength(0)
  })
})

describe('getDateFieldWarnings', () => {
  it('warns to use structured year metadata instead of raw symbols', () => {
    const warnings = getDateFieldWarnings('year', '<136!?>')

    expect(warnings).toContain(
      'Year contains angle brackets. Use the Reconstructed switch instead.',
    )
    expect(warnings).toContain(
      'Year contains !. Use the Emended switch instead.',
    )
    expect(warnings).toContain(
      'Value contains ?. Use the Uncertain switch instead.',
    )
  })

  it('single ! is standard pattern; no non-standard warning for year', () => {
    const warnings = getDateFieldWarnings('year', '1!')
    expect(warnings).toContain(
      'Year contains !. Use the Emended switch instead.',
    )
    expect(warnings).not.toContain(
      'Non-standard value may skip date conversion for this field.',
    )
  })

  it('warns for roman numerals in day/year values', () => {
    const warnings = getDateFieldWarnings('day', 'XIV')

    expect(warnings).toContain(
      'Non-standard value may skip date conversion for this field.',
    )
  })

  it('does not warn for standard numeric patterns', () => {
    expect(getDateFieldWarnings('year', '12a')).toEqual([])
    expect(getDateFieldWarnings('day', '15/17')).toEqual([])
  })
})
