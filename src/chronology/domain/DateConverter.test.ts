import DateConverter from 'chronology/domain/DateConverter'

describe('DateConverter', () => {
  let mesopotamianDate: DateConverter

  beforeEach(() => {
    mesopotamianDate = new DateConverter()
  })

  test('Set to Julian date', () => {
    const expected = {
      julianYear: -560,
      julianMonth: 4,
      julianDay: 3,
      bcJulianYear: 561,
      cjdn: 1516611,
      weekDay: 7,
      mesopotamianDay: 28,
      mesopotamianMonth: 12,
      mesopotamianMonthLength: 30,
      ruler: 'Nebuchadnezzar II',
      regnalYear: 43,
      seBabylonianYear: -250,
      lunationNabonassar: 2302,
    }
    mesopotamianDate.setToJulianDate(-560, 4, 3)
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toJulianDateString()).toEqual('3 April 561 BCE')
  })

  test('Set Mesopotamian date', () => {
    const expected = {
      julianYear: -580,
      julianMonth: 1,
      julianDay: 3,
      bcJulianYear: 581,
      cjdn: 1509215,
      weekDay: 3,
      mesopotamianDay: 14,
      mesopotamianMonth: 10,
      mesopotamianMonthLength: 29,
      ruler: 'Nebuchadnezzar II',
      regnalYear: 23,
      lunationNabonassar: 2052,
      seBabylonianYear: -270,
    }
    mesopotamianDate.setMesopotamianDate('Nebuchadnezzar II', 23, 10, 14)
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toJulianDateString()).toEqual('3 January 581 BCE')
  })

  test('Set Seleucid date', () => {
    mesopotamianDate.setSeBabylonianDate(100, 12, 26)
    const expected = {
      lunationNabonassar: 6631,
      ruler: 'Antiochus III [the Great]',
      regnalYear: 11,
      bcJulianYear: 211,
      julianDay: 3,
      cjdn: 1644448,
      julianMonth: 4,
      seBabylonianYear: 100,
      seMacedonianYear: 101,
      seArsacidYear: 36,
      mesopotamianDay: 26,
      mesopotamianMonth: 12,
      mesopotamianMonthLength: 29,
      weekDay: 3,
      julianYear: -210,
    }
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toJulianDateString()).toEqual('3 April 211 BCE')
  })

  test('Offset year', () => {
    mesopotamianDate.offsetYear(100)
    expect(mesopotamianDate.calendar.julianYear).toBe(-210)
    expect(mesopotamianDate.toJulianDateString()).toEqual('3 March 211 BCE')
  })

  test('Offset month', () => {
    mesopotamianDate.offsetMonth(5)
    expect(mesopotamianDate.calendar.julianMonth).toBe(8)
    expect(mesopotamianDate.calendar.julianYear).toBe(-310)
    expect(mesopotamianDate.toJulianDateString()).toEqual('3 August 311 BCE')
  })

  test('Offset day', () => {
    mesopotamianDate.offsetDay(10)
    expect(mesopotamianDate.calendar.julianDay).toBe(13)
    expect(mesopotamianDate.toJulianDateString()).toEqual('13 March 311 BCE')
  })
})
