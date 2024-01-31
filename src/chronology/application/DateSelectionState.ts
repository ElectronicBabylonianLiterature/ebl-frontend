import { MesopotamianDate } from 'chronology/domain/Date'
import { EponymDateField, Ur3Calendar } from 'chronology/domain/DateBase'
import { KingDateField } from 'chronology/domain/DateBase'
import usePromiseEffect from 'common/usePromiseEffect'
import { Eponym } from 'chronology/ui/DateEditor/Eponyms'
import { useState } from 'react'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  getDate,
  saveDateDefault,
} from 'chronology/application/DateSelectionMethods'

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

interface DateConditionParams {
  isAssyrianDate: boolean
  isSeleucidEra: boolean
  isCalendarFieldDisplayed
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

interface KingAndEponymBrokenUncertainParams {
  kingBroken?: boolean
  kingUncertain?: boolean
  eponymBroken?: boolean
  eponymUncertain?: boolean
  setKingBroken: React.Dispatch<React.SetStateAction<boolean>>
  setKingUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setEponymBroken: React.Dispatch<React.SetStateAction<boolean>>
  setEponymUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

interface KingAndEponymDateParams extends KingAndEponymBrokenUncertainParams {
  king?: KingDateField
  eponym?: EponymDateField
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
}

interface AdditionalDateStateParams
  extends DateConditionParams,
    KingAndEponymDateParams {
  ur3Calendar: Ur3Calendar | undefined
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}

export interface DateSelectionStateParams
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

function useDateConditionParams(date?: MesopotamianDate): DateConditionParams {
  const [isSeleucidEra, setIsSeleucidEra] = useState(
    date?.isSeleucidEra ?? false
  )
  const [isAssyrianDate, setIsAssyrianDate] = useState(
    date?.isAssyrianDate ?? false
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    date?.ur3Calendar ? true : false
  )

  return {
    isAssyrianDate,
    isSeleucidEra,
    isCalendarFieldDisplayed,
    setIsSeleucidEra,
    setIsAssyrianDate,
    setIsCalenderFieldDisplayed,
  }
}

function useKingAndEponymBrokenUncertain(
  date?: MesopotamianDate
): KingAndEponymBrokenUncertainParams {
  const [kingBroken, setKingBroken] = useState(date?.king?.isBroken ?? false)
  const [kingUncertain, setKingUncertain] = useState(
    date?.king?.isUncertain ?? false
  )
  const [eponymBroken, setEponymBroken] = useState(
    date?.king?.isBroken ?? false
  )
  const [eponymUncertain, setEponymUncertain] = useState(
    date?.king?.isUncertain ?? false
  )
  return {
    kingBroken,
    setKingBroken,
    kingUncertain,
    setKingUncertain,
    eponymBroken,
    setEponymBroken,
    eponymUncertain,
    setEponymUncertain,
  }
}

function useKingAndEponymDateParams(
  date?: MesopotamianDate
): KingAndEponymDateParams {
  const [king, setKing] = useState<KingDateField | undefined>(date?.king)
  const [eponym, setEponym] = useState<EponymDateField | undefined>(
    date?.eponym
  )
  return {
    ...useKingAndEponymBrokenUncertain(date),
    king,
    setKing,
    eponym,
    setEponym,
  }
}

function useAdditionalDateParams(
  date?: MesopotamianDate
): AdditionalDateStateParams {
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    date?.ur3Calendar ?? undefined
  )

  return {
    ...useDateConditionParams(date),
    ...useKingAndEponymDateParams(date),
    ur3Calendar,
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
