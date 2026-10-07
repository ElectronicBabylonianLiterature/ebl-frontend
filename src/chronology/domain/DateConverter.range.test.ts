import DateConverter from 'chronology/domain/DateConverter'
import { CalendarProps } from 'chronology/domain/DateConverterBase'

const converter = new DateConverter()
const { earliestDate, latestDate } = converter

function convertedJulian(year: number, month: number, day: number): number {
  const dateConverter = new DateConverter()
  dateConverter.setToJulianDate(year, month, day)
  return dateConverter.calendar.cjdn
}

const rangeEdges: [string, CalendarProps, number][] = [
  ['first', earliestDate, -1],
  ['last', latestDate, 1],
]

describe.each(rangeEdges)(
  'dates in the %s year of the valid range',
  (_edge, edgeDate, outward) => {
    const { julianYear, julianMonth, julianDay, cjdn } = edgeDate

    it('moves a month outside the range to the edge date', () => {
      expect(
        convertedJulian(julianYear, julianMonth + outward, julianDay),
      ).toEqual(cjdn)
    })

    it('moves a day outside the range to the edge date', () => {
      expect(
        convertedJulian(julianYear, julianMonth, julianDay + outward),
      ).toEqual(cjdn)
    })

    it('keeps the neighbouring day of the same month', () => {
      expect(
        convertedJulian(julianYear, julianMonth, julianDay - outward),
      ).toEqual(cjdn - outward)
    })
  },
)

describe('Julian dates in January and February', () => {
  it.each([
    [-600, 2, 15, 1501953],
    [-600, 1, 1, 1501908],
    [-600, 3, 1, 1501968],
    [-100, 2, 28, 1684591],
  ])(
    'converts %i-%i-%i to the day number %i',
    (year, month, day, expectedCjdn) => {
      expect(convertedJulian(year, month, day)).toEqual(expectedCjdn)
    },
  )

  it('keeps the Julian month the user entered', () => {
    const dateConverter = new DateConverter()
    dateConverter.setToJulianDate(-600, 2, 15)

    expect(dateConverter.calendar.julianMonth).toEqual(2)
    expect(dateConverter.calendar.julianDay).toEqual(15)
  })
})

it('rejects a Babylonian month that does not exist', () => {
  expect(() => new DateConverter().setToSeBabylonianDate(100, 15, 1)).toThrow(
    'Could not find matching Babylonian date in data.',
  )
})
