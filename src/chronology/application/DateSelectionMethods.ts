import Bluebird from 'bluebird'
import { MesopotamianDate } from 'chronology/domain/Date'
import { DateFieldDto, MonthFieldDto } from 'fragmentarium/domain/FragmentDtos'
import { Fragment } from 'fragmentarium/domain/fragment'
import { DateSelectionStateParams } from './DateSelectionState'
import {
  EponymDateField,
  KingDateField,
} from 'chronology/domain/DateParameters'

interface SaveDateParams {
  date?: MesopotamianDate
  updatedDate?: MesopotamianDate
  index?: number
  cancelUpdatePromise: () => void
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setUpdatePromise: (promise: Bluebird<void>) => void
  updateDate: (
    date?: MesopotamianDate | undefined,
    index?: number | undefined,
  ) => Bluebird<Fragment>
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

export function saveDateDefault({
  date,
  updatedDate,
  index,
  cancelUpdatePromise,
  setIsSaving,
  setUpdatePromise,
  updateDate,
  setDate,
  setIsDisplayed,
}: SaveDateParams): void {
  if (updatedDate !== date) {
    cancelUpdatePromise()
    setIsSaving(true)
    setUpdatePromise(
      updateDate(updatedDate, index)
        .then(() => {
          setIsDisplayed(false)
        })
        .finally(() => setIsSaving(false))
        .then(() => setDate(updatedDate)),
    )
  }
}

export function getDate(params: DateSelectionStateParams): MesopotamianDate {
  return MesopotamianDate.fromJson({
    year: getYear(params),
    month: getMonth(params),
    day: getDay(params),
    king: getKing(params),
    eponym: getEponym(params),
    isSeleucidEra: params.isSeleucidEra,
    isAssyrianDate: params.isAssyrianDate,
    ur3Calendar:
      params.ur3Calendar && params.isCalendarFieldDisplayed
        ? params.ur3Calendar
        : undefined,
  })
}

function getYear(params: DateSelectionStateParams): DateFieldDto {
  return {
    value: params.isAssyrianDate ? '1' : params.yearValue,
    isBroken: params.isAssyrianDate ? undefined : params.yearBroken,
    isUncertain: params.isAssyrianDate ? undefined : params.yearUncertain,
  }
}

function getMonth(params: DateSelectionStateParams): MonthFieldDto {
  return {
    value: params.monthValue,
    isIntercalary: params.isIntercalary,
    isBroken: params.monthBroken,
    isUncertain: params.monthUncertain,
  }
}

function getDay(params: DateSelectionStateParams): DateFieldDto {
  return {
    value: params.dayValue,
    isBroken: params.dayBroken,
    isUncertain: params.dayUncertain,
  }
}

function getKing(params: DateSelectionStateParams): KingDateField | undefined {
  return params.king && !params.isSeleucidEra && !params.isAssyrianDate
    ? {
        ...params.king,
        isBroken: params.kingBroken,
        isUncertain: params.kingUncertain,
      }
    : undefined
}

function getEponym(
  params: DateSelectionStateParams,
): EponymDateField | undefined {
  return params.eponym && params.isAssyrianDate
    ? {
        ...params.eponym,
        isBroken: params.eponymBroken,
        isUncertain: params.eponymUncertain,
      }
    : undefined
}
