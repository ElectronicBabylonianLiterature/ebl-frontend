import DateConverter from 'chronology/domain/DateConverter'
import data from 'chronology/domain/dateConverterData.json'

describe('getMonthLength', () => {
  const dateConverter = new DateConverter()

  it.each([
    [false, 1900, 2, 28],
    [false, 2000, 2, 29],
    [false, 2004, 2, 29],
    [false, 2001, 2, 28],
    [true, 1900, 2, 29],
    [true, 2001, 2, 28],
    [false, 2001, 4, 30],
  ])(
    'isJulian %s, year %i, month %i has %i days',
    (isJulian, year, month, length) => {
      expect(dateConverter.getMonthLength(isJulian, year, month)).toEqual(
        length,
      )
    },
  )

  it('uses the current Gregorian date by default', () => {
    dateConverter.setToGregorianDate(-300, 2, 1)
    expect(dateConverter.calendar.gregorianYear).toEqual(-300)
    expect(dateConverter.getMonthLength()).toEqual(28)
  })

  it('uses the current Julian date when requested', () => {
    dateConverter.setToJulianDate(-300, 2, 1)
    expect(dateConverter.calendar.julianYear).toEqual(-300)
    expect(dateConverter.getMonthLength(true)).toEqual(29)
  })
})

describe('getMesopotamianMonthsOfSeYear', () => {
  const unknownMonthEntry = [99999, 99]

  afterEach(() => {
    data.seBabylonianYearMonthPeriod.splice(
      data.seBabylonianYearMonthPeriod.indexOf(unknownMonthEntry),
      1,
    )
  })

  it('falls back to the first month for an unknown month value', () => {
    data.seBabylonianYearMonthPeriod.push(unknownMonthEntry)
    expect(new DateConverter().getMesopotamianMonthsOfSeYear(99999)).toEqual([
      { name: 'Nisannu', number: 'I', value: 1 },
    ])
  })
})
