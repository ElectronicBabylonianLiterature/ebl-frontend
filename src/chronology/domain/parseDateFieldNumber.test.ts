import parseDateFieldNumber, {
  isApproximateDateFieldValue,
} from 'chronology/domain/parseDateFieldNumber'

describe('parseDateFieldNumber', () => {
  it('parses bracketed and marked numeric values', () => {
    expect(parseDateFieldNumber('<136>')).toBe(136)
    expect(parseDateFieldNumber('[136]')).toBe(136)
    expect(parseDateFieldNumber('(136)')).toBe(136)
    expect(parseDateFieldNumber('136!')).toBe(136)
    expect(parseDateFieldNumber('136?')).toBe(136)
  })

  it('parses supported mixed numeric forms', () => {
    expect(parseDateFieldNumber('12a')).toBe(12)
    expect(parseDateFieldNumber('1+')).toBe(1)
    expect(parseDateFieldNumber('x+7')).toBe(7)
    expect(parseDateFieldNumber('14-17')).toBe(14)
    expect(parseDateFieldNumber('15/17')).toBe(15)
  })
})

describe('isApproximateDateFieldValue', () => {
  it.each([
    ['1+'],
    ['12+'],
    ['x+7'],
    ['X+12'],
    ['14-17'],
    ['1-2'],
    ['15/17'],
    ['12/13'],
  ])('returns true for approximate pattern %s', (value) => {
    expect(isApproximateDateFieldValue(value)).toBe(true)
  })

  it.each([
    ['12'],
    ['x'],
    ['<136>'],
    ['[5]'],
    ['(3)'],
    ['12?'],
    ['12!'],
    ['12a'],
    ['foo'],
    [''],
  ])('returns false for non-approximate pattern %s', (value) => {
    expect(isApproximateDateFieldValue(value)).toBe(false)
  })
})
