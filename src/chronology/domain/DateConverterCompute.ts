import _ from 'lodash'
import data from 'chronology/domain/dateConverterData.json'
import { CalendarProps } from './DateConverterBase'

function divmod(
  numerator: number,
  denominator: number,
): { quotient: number; remainder: number } {
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return { quotient, remainder }
}

export default class DateConverterCompute {
  calendar: CalendarProps = {
    gregorianYear: 0,
    gregorianMonth: 0,
    gregorianDay: 0,
    julianYear: 0,
    julianMonth: 0,
    julianDay: 0,
    cjdn: 0,
    weekDay: 0,
    mesopotamianMonth: 0,
    seBabylonianYear: 0,
    lunationNabonassar: 0,
  }

  computeCjdnFromSeBabylonian(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number,
  ): number {
    const i = this.findIndexInSeBabylonianYearMonthPeriod([
      seBabylonianYear,
      mesopotamianMonth,
    ])
    return data.babylonianCjdnPeriod[i] + mesopotamianDay - 1
  }

  computeJulianDateFromCjnd(cjdn: number): {
    year: number
    month: number
    day: number
  } {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)
    const day = b - d - Math.floor(30.6001 * e)
    const month = e < 14 ? e - 1 : e - 13
    const year = month > 2 ? c - 4716 : c - 4715
    return { year, month, day }
  }

  computeGregorianDateFromCjdn(cjdn: number): {
    year: number
    month: number
    day: number
  } {
    const J0 = 1721120
    const s = cjdn - J0
    const alpha1 = Math.floor((400 * s + 799) / 146097)
    const a1 = alpha1 + Math.floor(this.sTmp(s, alpha1) / 367)
    const { quotient: m1, remainder: epsilon1 } = divmod(
      5 * this.sTmp(s, a1) + 2,
      153,
    )
    const { quotient: alpha2b, remainder: m0 } = divmod(m1 + 2, 12)
    return {
      year: a1 + alpha2b < 1 ? a1 + alpha2b : a1 + alpha2b,
      month: m0 + 1,
      day: Math.floor(epsilon1 / 5) + 1,
    }
  }

  private sTmp(s: number, a: number): number {
    return (
      s -
      365 * a -
      Math.floor(a / 4) +
      Math.floor(a / 100) -
      Math.floor(a / 400)
    )
  }

  computeCjdnFromJulianDate({
    julianYear,
    julianMonth,
    julianDay,
  }: {
    julianYear: number
    julianMonth: number
    julianDay: number
  }): number {
    if (julianMonth < 3 && this.calendar.julianMonth > 2) {
      julianYear -= 1
      julianMonth += 12
      this.calendar = { ...this.calendar, julianMonth }
    }
    const cjdn =
      Math.floor(365.25 * (julianYear + 4716)) +
      Math.floor(30.6001 * (julianMonth + 1)) +
      julianDay -
      1524
    return cjdn
  }

  computeCjdnFromGregorianDate({
    gregorianYear,
    gregorianMonth,
    gregorianDay,
  }: {
    gregorianYear: number
    gregorianMonth: number
    gregorianDay: number
  }): number {
    if (gregorianMonth < 3) {
      gregorianYear -= 1
      gregorianMonth += 12
    }
    const monthDays = Math.floor(30.6001 * (gregorianMonth + 1))
    const century = gregorianYear === 0 ? -1 : Math.floor(gregorianYear / 100)
    const leapYearCorrection = Math.floor(century / 4)
    const fixedDay = 2 - century + leapYearCorrection
    const yearDays = Math.floor(365.25 * (gregorianYear + 4716))
    return Math.floor(fixedDay + gregorianDay + yearDays + monthDays - 1524)
  }

  computeWeekDay(cjdn: number): number {
    return ((cjdn + 1) % 7) + 1
  }

  computeBabylonianValues(cjdn: number): {
    i: number
    lunationNabonassar: number
    seBabylonianYear: number
    mesopotamianMonth: number
  } {
    const i = this.findIndexInBabylonianCjdnPeriod(cjdn)
    const [seBabylonianYear, mesopotamianMonth] =
      data.seBabylonianYearMonthPeriod[i - 1]
    return {
      i,
      lunationNabonassar: 1498 + i,
      seBabylonianYear,
      mesopotamianMonth,
    }
  }

  computeRegnalValues(seBabylonianYear: number): {
    ruler?: string
    regnalYear: number
    regnalYears: number
  } {
    const j = data.rulerSeYears.findIndex((year) => year > seBabylonianYear)
    const ruler = seBabylonianYear < 168 ? data.rulerName[j - 1] : undefined
    const regnalYear = seBabylonianYear - data.rulerSeYears[j - 1] + 1
    const regnalYears = data.rulerSeYears[j] - data.rulerSeYears[j - 1]
    return { ruler, regnalYear, regnalYears }
  }

  calculateSeMacedonianYear(
    seBabylonianYear: number,
    mesopotamianMonth: number,
  ): number | undefined {
    if (seBabylonianYear > 0 && mesopotamianMonth < 7) {
      return seBabylonianYear
    }
    if (seBabylonianYear > -1 && mesopotamianMonth > 6) {
      return seBabylonianYear + 1
    }
    return undefined
  }

  calculateSeArsacidYear(seBabylonianYear: number): number | undefined {
    return seBabylonianYear >= 65 ? seBabylonianYear - 64 : undefined
  }

  findIndexInSeBabylonianYearMonthPeriod(yearMonth: [number, number]): number {
    const i = data.seBabylonianYearMonthPeriod.findIndex((ym) =>
      _.isEqual(ym, yearMonth),
    )
    if (i === -1)
      throw new Error('Could not find matching Babylonian date in data.')
    return i
  }

  findIndexInBabylonianCjdnPeriod(cjdn: number): number {
    return data.babylonianCjdnPeriod.findIndex((cjdnPd) => cjdnPd > cjdn)
  }
}
