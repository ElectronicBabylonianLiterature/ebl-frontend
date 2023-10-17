import DateConverter from 'chronology/domain/DateConverter'

const dateJulianEraBegin = {
  bcJulianYear: 311,
  cjdn: 1607923,
  gregorianYear: -309,
  bcGregorianYear: 310,
  gregorianMonth: 3,
  gregorianDay: 29,
  julianDay: 3,
  julianMonth: 4,
  julianYear: -310,
  lunationNabonassar: 5395,
  mesopotamianDay: 1,
  mesopotamianMonth: 1,
  mesopotamianMonthLength: 29,
  regnalYear: 1,
  ruler: 'Seleucus I Nicator',
  seBabylonianYear: 1,
  seMacedonianYear: 1,
  weekDay: 4,
}

const dateNebuchadnezzarIIY43M12D28 = {
  gregorianYear: -559,
  bcGregorianYear: 560,
  gregorianMonth: 3,
  gregorianDay: 28,
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

const dateNebuchadnezzarIIY23M10D14 = {
  gregorianYear: -580,
  bcGregorianYear: 581,
  gregorianMonth: 12,
  gregorianDay: 28,
  julianYear: -580,
  bcJulianYear: 581,
  julianMonth: 1,
  julianDay: 3,
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

const dateSeleucidY100M12D26 = {
  gregorianYear: -209,
  bcGregorianYear: 210,
  gregorianMonth: 3,
  gregorianDay: 30,
  julianYear: -210,
  julianMonth: 4,
  julianDay: 3,
  lunationNabonassar: 6631,
  ruler: 'Antiochus III [the Great]',
  regnalYear: 11,
  bcJulianYear: 211,
  cjdn: 1644448,
  seBabylonianYear: 100,
  seMacedonianYear: 101,
  seArsacidYear: 36,
  mesopotamianMonthLength: 29,
  weekDay: 3,
  mesopotamianMonth: 12,
  mesopotamianDay: 26,
}

describe('DateConverter', () => {
  let mesopotamianDate: DateConverter

  beforeEach(() => {
    mesopotamianDate = new DateConverter()
  })

  test('Check initial state', () => {
    const expected = dateJulianEraBegin
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toDateString()).toEqual('29 March 310 BCE PGC')
    expect(mesopotamianDate.toDateString('Julian')).toEqual(
      '3 April 311 BCE PJC'
    )
  })

  test('Set to Gregorian date', () => {
    const expected = dateNebuchadnezzarIIY43M12D28
    mesopotamianDate.setToGregorianDate(-559, 3, 28)
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toDateString()).toEqual('28 March 560 BCE PGC')
    expect(mesopotamianDate.toDateString('Julian')).toEqual(
      '3 April 561 BCE PJC'
    )
  })

  test('Set to Julian date', () => {
    const expected = dateNebuchadnezzarIIY43M12D28
    mesopotamianDate.setToJulianDate(-560, 4, 3)
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toDateString()).toEqual('28 March 560 BCE PGC')
    expect(mesopotamianDate.toDateString('Julian')).toEqual(
      '3 April 561 BCE PJC'
    )
  })

  test('Set to Mesopotamian date', () => {
    const expected = dateNebuchadnezzarIIY23M10D14
    mesopotamianDate.setToMesopotamianDate('Nebuchadnezzar II', 23, 10, 14)
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toDateString()).toEqual('28 December 581 BCE PGC')
    expect(mesopotamianDate.toDateString('Julian')).toEqual(
      '3 January 581 BCE PJC'
    )
  })

  test('Set to Seleucid date', () => {
    mesopotamianDate.setToSeBabylonianDate(100, 12, 26)
    const expected = dateSeleucidY100M12D26
    expect(mesopotamianDate.calendar).toEqual(expected)
    expect(mesopotamianDate.toDateString()).toEqual('30 March 210 BCE PGC')
    expect(mesopotamianDate.toDateString('Julian')).toEqual(
      '3 April 211 BCE PJC'
    )
  })
})
