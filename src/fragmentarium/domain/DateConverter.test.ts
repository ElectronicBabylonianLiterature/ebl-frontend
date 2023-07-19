import DateConverter from './DateConverter'

describe('DateConverter', () => {
  let babylonDate: DateConverter

  beforeEach(() => {
    babylonDate = new DateConverter()
  })

  test('Set modern date', () => {
    babylonDate.setModernDate(-310, 3, 3)
    const expected = {
      year: -310,
      month: 3,
      day: 3,
      bcYear: '311',
      julianDay: 1607892,
      weekDay: 1,
      babylonianDay: 29,
      babylonianMonth: 11,
      babylonianRuler: '4 Alexander IV Aegus',
      seBabylonianYear: '0',
      seMacedonianYear: '1',
      arsacidYear: ' ',
      babylonianLunation: 5393,
      babylonianMonthLength: 29,
    }
    expect(babylonDate.calendar).toEqual(expected)
  })

  test('Set Babylonian date', () => {
    // WiP.
    // ToDo: Update to properly test.
    babylonDate.setBabylonianDate(-200, 10, 1)
    const expected = {
      year: -625,
      month: 11,
      day: 27,
      bcYear: '626',
      julianDay: 1493107,
      weekDay: 2,
      babylonianDay: 1,
      babylonianMonth: 9,
      babylonianRuler: '1 Interregnum',
      seBabylonianYear: '-314',
      seMacedonianYear: ' ',
      arsacidYear: ' ',
      babylonianLunation: 1507,
      babylonianMonthLength: 30,
    }
    expect(babylonDate.calendar).toEqual(expected)
  })

  test('Update year', () => {
    babylonDate.updateYear(100)
    expect(babylonDate.calendar.year).toBe(-210)
  })

  test('Update month', () => {
    babylonDate.updateMonth(5)
    expect(babylonDate.calendar.month).toBe(8)
    expect(babylonDate.calendar.year).toBe(-310)
  })

  test('Update day', () => {
    babylonDate.updateDay(10)
    expect(babylonDate.calendar.day).toBe(13)
  })

  test('Get current day', () => {
    babylonDate.calendar.day = 25
    expect(babylonDate.getCurrentDay()).toBe(25)
  })
})
