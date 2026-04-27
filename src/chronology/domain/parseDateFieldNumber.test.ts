import parseDateFieldNumber from 'chronology/domain/parseDateFieldNumber'

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
