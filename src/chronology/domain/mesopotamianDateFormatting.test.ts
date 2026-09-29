import {
  calendarToAbbreviation,
  insertDateApproximation,
  isApproximateDate,
  kingToModernDate,
} from 'chronology/domain/mesopotamianDateFormatting'
import { king } from 'test-support/date-fixtures'

describe('calendarToAbbreviation', () => {
  it.each([
    ['Julian', 'PJC'],
    ['Gregorian', 'PGC'],
  ] as const)('abbreviates %s as %s', (calendar, abbreviation) => {
    expect(calendarToAbbreviation(calendar)).toEqual(abbreviation)
  })
})

describe('insertDateApproximation', () => {
  it('prefixes approximate dates', () => {
    expect(insertDateApproximation('100 BCE', true)).toEqual('ca. 100 BCE')
  })

  it('keeps exact dates unchanged', () => {
    expect(insertDateApproximation('100 BCE', false)).toEqual('100 BCE')
  })
})

describe('isApproximateDate', () => {
  const exact = { value: '1' }

  it('is false for exact numeric fields', () => {
    expect(isApproximateDate(exact, exact, exact)).toBe(false)
  })

  it('is true when a field is not a number', () => {
    expect(isApproximateDate(exact, { value: 'x' }, exact)).toBe(true)
  })

  it('is true when a field is broken', () => {
    expect(
      isApproximateDate(exact, exact, { value: '1', isBroken: true }),
    ).toBe(true)
  })

  it('is true when a field is uncertain', () => {
    expect(
      isApproximateDate({ value: '1', isUncertain: true }, exact, exact),
    ).toBe(true)
  })

  it('is true when a field value is an approximate pattern', () => {
    expect(isApproximateDate({ value: '3+' }, exact, exact)).toBe(true)
  })
})

describe('kingToModernDate', () => {
  it('computes the year from the first reign year', () => {
    expect(kingToModernDate(king, 10)).toEqual('ca. 2325 BCE PJC')
  })

  it('uses the requested calendar', () => {
    expect(kingToModernDate(king, 1, 'Gregorian')).toEqual('ca. 2334 BCE PGC')
  })

  it('returns the reign when the year is not positive', () => {
    expect(kingToModernDate(king, 0)).toEqual('ca. 2334–2279 BCE PJC')
  })

  it.each([['?'], ['']])('returns empty string for king date "%s"', (date) => {
    expect(kingToModernDate({ ...king, date }, 0)).toEqual('')
  })

  it('returns empty string without a king', () => {
    expect(kingToModernDate(undefined, 1)).toEqual('')
  })
})
