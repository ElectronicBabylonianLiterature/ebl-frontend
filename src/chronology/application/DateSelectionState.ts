import { MesopotamianDate } from 'chronology/domain/Date'
import {
  EponymDateField,
  Ur3Calendar,
  KingDateField,
} from 'chronology/domain/DateParameters'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import { useState } from 'react'
import {
  getDate,
  saveDateDefault,
} from 'chronology/application/DateSelectionMethods'
import {
  AdditionalDateStateParams,
  DateConditionParams,
  DateEditorStateProps,
  DateSelectionState,
  DayStateParams,
  KingAndEponymBrokenUncertainParams,
  KingAndEponymDateParams,
  MonthStateParams,
  YearStateParams,
} from 'chronology/application/DateSelectionStateTypes'

export type {
  DateEditorStateProps,
  DateSelectionState,
  DateSelectionStateParams,
} from 'chronology/application/DateSelectionStateTypes'

function useYearState(date?: MesopotamianDate): YearStateParams {
  const originalYear = date?.yearZero ?? date?.year
  const [yearValue, setYearValue] = useState(originalYear?.value ?? '')
  const [yearBroken, setYearBroken] = useState(originalYear?.isBroken ?? false)
  const [yearUncertain, setYearUncertain] = useState(
    originalYear?.isUncertain ?? false,
  )
  const [yearReconstructed, setYearReconstructed] = useState(
    originalYear?.isReconstructed ?? false,
  )
  const [yearEmended, setYearEmended] = useState(
    originalYear?.isEmended ?? false,
  )
  return {
    yearValue,
    yearBroken,
    yearUncertain,
    yearReconstructed,
    yearEmended,
    setYearValue,
    setYearBroken,
    setYearUncertain,
    setYearReconstructed,
    setYearEmended,
  }
}

function useMonthState(date?: MesopotamianDate): MonthStateParams {
  const [monthValue, setMonthValue] = useState(date?.month.value ?? '')
  const [isIntercalary, setIntercalary] = useState(
    date?.month.isIntercalary ?? false,
  )
  const [monthBroken, setMonthBroken] = useState(date?.month.isBroken ?? false)
  const [monthUncertain, setMonthUncertain] = useState(
    date?.month.isUncertain ?? false,
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
    date?.day.isUncertain ?? false,
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
    date?.isSeleucidEra ?? false,
  )
  const [isAssyrianDate, setIsAssyrianDate] = useState(
    date?.isAssyrianDate ?? false,
  )
  const [isCalendarFieldDisplayed, setIsCalenderFieldDisplayed] = useState(
    date?.ur3Calendar ? true : false,
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
  date?: MesopotamianDate,
): KingAndEponymBrokenUncertainParams {
  const originalKing = date?.zeroYearKing ?? date?.king
  const [kingBroken, setKingBroken] = useState(originalKing?.isBroken ?? false)
  const [kingUncertain, setKingUncertain] = useState(
    originalKing?.isUncertain ?? false,
  )
  const [eponymBroken, setEponymBroken] = useState(
    originalKing?.isBroken ?? false,
  )
  const [eponymUncertain, setEponymUncertain] = useState(
    originalKing?.isUncertain ?? false,
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
  date?: MesopotamianDate,
): KingAndEponymDateParams {
  const [king, setKing] = useState<KingDateField | undefined>(
    date?.zeroYearKing ?? date?.king,
  )
  const [eponym, setEponym] = useState<EponymDateField | undefined>(
    date?.eponym,
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
  date?: MesopotamianDate,
): AdditionalDateStateParams {
  const [ur3Calendar, setUr3Calendar] = useState<Ur3Calendar | undefined>(
    date?.ur3Calendar ?? undefined,
  )

  return {
    ...useDateConditionParams(date),
    ...useKingAndEponymDateParams(date),
    ur3Calendar,
    setUr3Calendar,
  }
}

export default function useDateSelectionState(
  props: DateEditorStateProps,
): DateSelectionState {
  const [, , runUpdate] = usePromiseEffect()
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
      runUpdate,
      updatedDate,
    })

  const _getDate = () => getDate(stateParams)

  return {
    ...stateParams,
    getDate: _getDate,
    saveDate: saveDateOverride ?? _saveDate,
  }
}
