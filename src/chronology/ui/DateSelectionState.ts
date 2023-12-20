import { MesopotamianDate } from 'chronology/domain/Date'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import { King } from 'chronology/ui/BrinkmanKings'
import usePromiseEffect from 'common/usePromiseEffect'
import { Eponym } from 'chronology/ui/Eponyms'
import { useState } from 'react'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import { DateFieldDto, MonthFieldDto } from 'fragmentarium/domain/FragmentDtos'

export interface DateEditorStateProps {
  date?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

interface YearStateParams {
  yearValue: string
  yearBroken: boolean
  yearUncertain: boolean
  setYearValue: React.Dispatch<React.SetStateAction<string>>
  setYearBroken: React.Dispatch<React.SetStateAction<boolean>>
  setYearUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

interface MonthStateParams {
  monthValue: string
  monthBroken: boolean
  monthUncertain: boolean
  isIntercalary: boolean
  setMonthValue: React.Dispatch<React.SetStateAction<string>>
  setMonthBroken: React.Dispatch<React.SetStateAction<boolean>>
  setMonthUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary: React.Dispatch<React.SetStateAction<boolean>>
}

interface DayStateParams {
  dayValue: string
  dayBroken: boolean
  dayUncertain: boolean
  setDayValue: React.Dispatch<React.SetStateAction<string>>
  setDayBroken: React.Dispatch<React.SetStateAction<boolean>>
  setDayUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

interface AdditionalDateStateParams {
  king: King | undefined
  eponym: Eponym | undefined
  isAssyrianDate: boolean
  isSeleucidEra: boolean
  isCalendarFieldDisplayed
  ur3Calendar: Ur3Calendar | undefined
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}

interface DateSelectionStateParams
  extends YearStateParams,
    MonthStateParams,
    DayStateParams,
    AdditionalDateStateParams {}

export interface DateSelectionState extends DateSelectionStateParams {
  getDate: () => MesopotamianDate
  saveDate:
    | ((
        updatedDate?: MesopotamianDate | undefined,
        index?: number | undefined
      ) => void)
    | ((updatedDate?: MesopotamianDate) => void)
}

interface SaveDateParams {
  date?: MesopotamianDate
  updatedDate?: MesopotamianDate
  index?: number
  cancelUpdatePromise: () => void
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setUpdatePromise: (promise: Bluebird<void>) => void
  updateDate: (
    date?: MesopotamianDate | undefined,
    index?: number | undefined
  ) => Bluebird<Fragment>
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

function saveDateDefault({
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
        .then(() => setDate(updatedDate))
    )
  }
}

function getDate(params: DateSelectionStateParams): MesopotamianDate {
  return MesopotamianDate.fromJson({
    year: getYear(params),
    month: getMonth(params),
    day: getDay(params),
    king:
      params.king && !params.isSeleucidEra && !params.isAssyrianDate
        ? params.king
        : undefined,
    eponym: params.eponym && params.isAssyrianDate ? params.eponym : undefined,
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

function useYearState(date?: MesopotamianDate): YearStateParams {
  const [yearValue, setYearValue] = useState(date?.year.value ?? '')
  const [yearBroken, setYearBroken] = useState(date?.year.isBroken ?? false)
  const [yearUncertain, setYearUncertain] = useState(
    date?.year.isUncertain ?? false
  )
  return {
    yearValue,
    yearBroken,
    yearUncertain,
    setYearValue,
    setYearBroken,
    setYearUncertain,
  }
}

function useMonthState(date?: MesopotamianDate): MonthStateParams {
  const [monthValue, setMonthValue] = useState(date?.month.value ?? '')
  const [isIntercalary, setIntercalary] = useState(
    date?.month.isIntercalary ?? false
  )
  const [monthBroken, setMonthBroken] = useState(date?.month.isBroken ?? false)
  const [monthUncertain, setMonthUncertain] = useState(
    date?.month.isUncertain ?? false
  )
  return {
    monthValue,
    monthBroken,
    monthUncertain,
    isIntercalary,
    setMonthValue,
    setMonthBroken,
    setMonthUncertain,
    setIntercalary,
  }
}

function useDayState(date?: MesopotamianDate): DayStateParams {
  const [dayValue, setDayValue] = useState(date?.day.value ?? '')
  const [dayBroken, setDayBroken] = useState(date?.day.isBroken ?? false)
  const [dayUncertain, setDayUncertain] = useState(
    date?.day.isUncertain ?? false
  )
  return {
    dayValue,
    dayBroken,
    dayUncertain,
    setDayValue,
    setDayBroken,
    setDayUncertain,
  }
}

function useAdditionalDateParams(
  date?: MesopotamianDate
): AdditionalDateStateParams {
  const [isSeleucidEra, setIsSeleucidEra] = useState(
    date?.isSeleucidEra ?? false
  )
  const [isAssyrianDate, setIsAssyrianDate] = useState(
    date?.isAssyrianDate ?? false
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    date?.ur3Calendar ? true : false
  )
  const [king, setKing] = useState<King | undefined>(date?.king)
  const [eponym, setEponym] = useState<Eponym | undefined>(date?.eponym)
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    date?.ur3Calendar ?? undefined
  )
  return {
    king,
    eponym,
    isAssyrianDate,
    isSeleucidEra,
    isCalendarFieldDisplayed,
    ur3Calendar,
    setKing,
    setEponym,
    setIsSeleucidEra,
    setIsAssyrianDate,
    setIsCalenderFieldDisplayed,
    setUr3Calendar,
  }
}

export default function useDateSelectionState(
  props: DateEditorStateProps
): DateSelectionState {
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()
  const { date, saveDateOverride } = props

  const stateParams = {
    ...useYearState(date),
    ...useMonthState(date),
    ...useDayState(date),
    ...useAdditionalDateParams(date),
  }
  const _saveDate = (updatedDate) =>
    saveDateDefault({
      ...props,
      cancelUpdatePromise,
      setUpdatePromise,
      updatedDate,
    })

  const _getDate = () => getDate(stateParams)

  return {
    ...stateParams,
    getDate: _getDate,
    saveDate: saveDateOverride ?? _saveDate,
  }
}
