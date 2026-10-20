import { getDate } from 'chronology/application/DateSelectionMethods'
import { DateSelectionStateParams } from 'chronology/application/DateSelectionStateTypes'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import { EponymDateField } from 'chronology/domain/DateParameters'
import Kings from 'chronology/domain/Kings.json'

const king = Kings.find((candidate) => candidate.name === 'Nabonidus')!
const eponym: EponymDateField = {
  date: '910',
  isKing: true,
  name: 'Adad-nērārī (II)',
  phase: 'NA',
  title: 'king',
}

const noop = jest.fn()

function buildParams(
  overrides: Partial<DateSelectionStateParams> = {},
): DateSelectionStateParams {
  return {
    yearValue: '7',
    yearBroken: true,
    yearUncertain: true,
    yearReconstructed: true,
    yearEmended: true,
    setYearValue: noop,
    setYearBroken: noop,
    setYearUncertain: noop,
    setYearReconstructed: noop,
    setYearEmended: noop,
    monthValue: '2',
    monthBroken: true,
    monthUncertain: false,
    isIntercalary: true,
    setMonthValue: noop,
    setMonthBroken: noop,
    setMonthUncertain: noop,
    setIntercalary: noop,
    dayValue: '3',
    dayBroken: false,
    dayUncertain: true,
    setDayValue: noop,
    setDayBroken: noop,
    setDayUncertain: noop,
    isAssyrianDate: false,
    isSeleucidEra: false,
    isCalendarFieldDisplayed: false,
    setIsSeleucidEra: noop,
    setIsAssyrianDate: noop,
    setIsCalenderFieldDisplayed: noop,
    king: undefined,
    eponym: undefined,
    kingBroken: undefined,
    kingUncertain: undefined,
    eponymBroken: undefined,
    eponymUncertain: undefined,
    setKing: noop,
    setEponym: noop,
    setKingBroken: noop,
    setKingUncertain: noop,
    setEponymBroken: noop,
    setEponymUncertain: noop,
    ur3Calendar: undefined,
    setUr3Calendar: noop,
    ...overrides,
  }
}

describe('getDate', () => {
  it('keeps the year fields for non-Assyrian dates', () => {
    const date = getDate(buildParams())

    expect(date.year).toMatchObject({
      value: '7',
      isBroken: true,
      isUncertain: true,
      isReconstructed: true,
      isEmended: true,
    })
    expect(date.month).toMatchObject({
      value: '2',
      isIntercalary: true,
      isBroken: true,
    })
    expect(date.day).toMatchObject({ value: '3', isUncertain: true })
  })

  it('forces year 1 without modifiers for Assyrian dates', () => {
    const date = getDate(buildParams({ isAssyrianDate: true }))

    expect(date.year.value).toEqual('1')
    expect(date.year.isBroken).toBeUndefined()
    expect(date.year.isUncertain).toBeUndefined()
    expect(date.year.isReconstructed).toBeUndefined()
    expect(date.year.isEmended).toBeUndefined()
  })

  it('includes the king for regnal dates', () => {
    const date = getDate(
      buildParams({ king, kingBroken: true, kingUncertain: false }),
    )

    expect(date.king).toMatchObject({
      name: 'Nabonidus',
      isBroken: true,
      isUncertain: false,
    })
    expect(date.eponym).toBeUndefined()
  })

  it('omits the king for Seleucid dates', () => {
    const date = getDate(buildParams({ king, isSeleucidEra: true }))

    expect(date.king).toBeUndefined()
  })

  it('omits the king for Assyrian dates', () => {
    const date = getDate(buildParams({ king, isAssyrianDate: true }))

    expect(date.king).toBeUndefined()
  })

  it('includes the eponym for Assyrian dates', () => {
    const date = getDate(
      buildParams({
        eponym,
        isAssyrianDate: true,
        eponymBroken: false,
        eponymUncertain: true,
      }),
    )

    expect(date.eponym).toMatchObject({
      name: 'Adad-nērārī (II)',
      isBroken: false,
      isUncertain: true,
    })
  })

  it('omits the eponym for non-Assyrian dates', () => {
    const date = getDate(buildParams({ eponym }))

    expect(date.eponym).toBeUndefined()
  })

  it('includes the Ur III calendar only when the field is displayed', () => {
    expect(
      getDate(
        buildParams({
          ur3Calendar: Ur3Calendar.UMMA,
          isCalendarFieldDisplayed: true,
        }),
      ).ur3Calendar,
    ).toEqual(Ur3Calendar.UMMA)

    expect(
      getDate(
        buildParams({
          ur3Calendar: Ur3Calendar.UMMA,
          isCalendarFieldDisplayed: false,
        }),
      ).ur3Calendar,
    ).toBeUndefined()

    expect(
      getDate(
        buildParams({
          ur3Calendar: undefined,
          isCalendarFieldDisplayed: true,
        }),
      ).ur3Calendar,
    ).toBeUndefined()
  })
})
