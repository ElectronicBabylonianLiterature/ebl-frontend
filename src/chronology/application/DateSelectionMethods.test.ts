import Bluebird from 'bluebird'
import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateParameters'
import { DateSelectionStateParams } from 'chronology/application/DateSelectionState'
import {
  getDate,
  saveDateDefault,
} from 'chronology/application/DateSelectionMethods'
import { findKingByOrderGlobal, King } from 'chronology/ui/Kings/Kings'
import { Fragment } from 'fragmentarium/domain/fragment'

const urNamma = findKingByOrderGlobal(12) as King
const eponym = { name: 'Adad-nerari', phase: 'NA' as const }

function createDateSelectionParams(
  overrides: Partial<DateSelectionStateParams> = {},
): DateSelectionStateParams {
  return {
    yearValue: '5',
    yearBroken: true,
    yearUncertain: false,
    yearReconstructed: true,
    yearEmended: false,
    monthValue: '3',
    monthBroken: false,
    monthUncertain: true,
    isIntercalary: false,
    dayValue: '12',
    dayBroken: true,
    dayUncertain: false,
    isAssyrianDate: false,
    isSeleucidEra: false,
    isCalendarFieldDisplayed: false,
    king: urNamma,
    kingBroken: true,
    kingUncertain: false,
    eponym,
    eponymBroken: false,
    eponymUncertain: true,
    ur3Calendar: Ur3Calendar.UMMA,
    setYearValue: jest.fn(),
    setYearBroken: jest.fn(),
    setYearUncertain: jest.fn(),
    setYearReconstructed: jest.fn(),
    setYearEmended: jest.fn(),
    setMonthValue: jest.fn(),
    setMonthBroken: jest.fn(),
    setMonthUncertain: jest.fn(),
    setIntercalary: jest.fn(),
    setDayValue: jest.fn(),
    setDayBroken: jest.fn(),
    setDayUncertain: jest.fn(),
    setIsSeleucidEra: jest.fn(),
    setIsAssyrianDate: jest.fn(),
    setIsCalenderFieldDisplayed: jest.fn(),
    setKing: jest.fn(),
    setEponym: jest.fn(),
    setKingBroken: jest.fn(),
    setKingUncertain: jest.fn(),
    setEponymBroken: jest.fn(),
    setEponymUncertain: jest.fn(),
    setUr3Calendar: jest.fn(),
    ...overrides,
  }
}

describe('getDate', () => {
  it('builds a regnal date with the king and its annotations', () => {
    const date = getDate(createDateSelectionParams())

    expect(date.year).toEqual({
      value: '5',
      isBroken: true,
      isUncertain: false,
      isReconstructed: true,
      isEmended: false,
    })
    expect(date.month).toEqual({
      value: '3',
      isIntercalary: false,
      isBroken: false,
      isUncertain: true,
    })
    expect(date.day).toEqual({
      value: '12',
      isBroken: true,
      isUncertain: false,
    })
    expect(date.king).toEqual(
      expect.objectContaining({
        orderGlobal: 12,
        isBroken: true,
        isUncertain: false,
      }),
    )
    expect(date.eponym).toBeUndefined()
    expect(date.ur3Calendar).toBeUndefined()
  })

  it('keeps the Ur III calendar only while the calendar field is displayed', () => {
    const date = getDate(
      createDateSelectionParams({ isCalendarFieldDisplayed: true }),
    )

    expect(date.ur3Calendar).toBe(Ur3Calendar.UMMA)
  })

  it('drops the king from a Seleucid era date', () => {
    const date = getDate(createDateSelectionParams({ isSeleucidEra: true }))

    expect(date.isSeleucidEra).toBe(true)
    expect(date.king).toBeUndefined()
  })

  it('builds an Assyrian date from the eponym with a fixed first year', () => {
    const date = getDate(createDateSelectionParams({ isAssyrianDate: true }))

    expect(date.year).toEqual({
      value: '1',
      isBroken: undefined,
      isUncertain: undefined,
      isReconstructed: undefined,
      isEmended: undefined,
    })
    expect(date.king).toBeUndefined()
    expect(date.eponym).toEqual({
      ...eponym,
      isBroken: false,
      isUncertain: true,
    })
  })

  it('leaves out the king and eponym when none are selected', () => {
    const date = getDate(
      createDateSelectionParams({
        king: undefined,
        eponym: undefined,
        isAssyrianDate: true,
      }),
    )

    expect(date.king).toBeUndefined()
    expect(date.eponym).toBeUndefined()
  })
})

describe('saveDateDefault', () => {
  const savedDate = getDate(createDateSelectionParams())

  function createSaveParams(
    updatedDate: MesopotamianDate,
  ): Parameters<typeof saveDateDefault>[0] {
    return {
      date: savedDate,
      updatedDate,
      index: 2,
      cancelUpdatePromise: jest.fn(),
      setIsSaving: jest.fn(),
      setUpdatePromise: jest.fn(),
      updateDate: jest
        .fn()
        .mockReturnValue(Bluebird.resolve({} as unknown as Fragment)),
      setDate: jest.fn(),
      setIsDisplayed: jest.fn(),
    }
  }

  it('does nothing when the date is unchanged', () => {
    const saveParams = createSaveParams(savedDate)

    saveDateDefault(saveParams)

    expect(saveParams.cancelUpdatePromise).not.toHaveBeenCalled()
    expect(saveParams.updateDate).not.toHaveBeenCalled()
  })

  it('saves a changed date, then hides the editor and stores the date', async () => {
    const updatedDate = getDate(createDateSelectionParams({ dayValue: '13' }))
    const saveParams = createSaveParams(updatedDate)

    saveDateDefault(saveParams)
    const updatePromise = (saveParams.setUpdatePromise as jest.Mock).mock
      .calls[0][0]
    await updatePromise

    expect(saveParams.cancelUpdatePromise).toHaveBeenCalled()
    expect(saveParams.setIsSaving).toHaveBeenNthCalledWith(1, true)
    expect(saveParams.updateDate).toHaveBeenCalledWith(updatedDate, 2)
    expect(saveParams.setIsDisplayed).toHaveBeenCalledWith(false)
    expect(saveParams.setIsSaving).toHaveBeenLastCalledWith(false)
    expect(saveParams.setDate).toHaveBeenCalledWith(updatedDate)
  })
})
