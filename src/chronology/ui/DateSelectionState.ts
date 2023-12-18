import { MesopotamianDate, Ur3Calendar } from 'chronology/domain/Date'
import { King } from 'chronology/ui/BrinkmanKings'
import usePromiseEffect from 'common/usePromiseEffect'
import { Eponym } from 'chronology/ui/Eponyms'
import { useState } from 'react'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'

export interface DateEditorStateProps {
  date?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Bluebird<Fragment>
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

export interface DateSelectionState {
  yearValue: string
  yearBroken: boolean
  yearUncertain: boolean
  monthValue: string
  monthBroken: boolean
  monthUncertain: boolean
  dayValue: string
  dayBroken: boolean
  dayUncertain: boolean
  king: King | undefined
  eponym: Eponym | undefined
  isIntercalary: boolean
  isAssyrianDate: boolean
  isSeleucidEra: boolean
  isCalendarFieldDisplayed
  ur3Calendar: Ur3Calendar | undefined
  setYearValue: React.Dispatch<React.SetStateAction<string>>
  setYearBroken: React.Dispatch<React.SetStateAction<boolean>>
  setYearUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setMonthValue: React.Dispatch<React.SetStateAction<string>>
  setMonthBroken: React.Dispatch<React.SetStateAction<boolean>>
  setMonthUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary: React.Dispatch<React.SetStateAction<boolean>>
  setDayValue: React.Dispatch<React.SetStateAction<string>>
  setDayBroken: React.Dispatch<React.SetStateAction<boolean>>
  setDayUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>
  setEponym: React.Dispatch<React.SetStateAction<Eponym | undefined>>
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
  getDate: () => MesopotamianDate
  saveDate:
    | ((
        updatedDate?: MesopotamianDate | undefined,
        index?: number | undefined
      ) => void)
    | ((updatedDate?: MesopotamianDate) => void)
}

export default function useDateSelectionState({
  date,
  setDate,
  updateDate,
  index,
  setIsDisplayed,
  setIsSaving,
  saveDateOverride,
}: DateEditorStateProps): DateSelectionState {
  const [setUpdatePromise, cancelUpdatePromise] = usePromiseEffect<void>()
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
  const [yearValue, setYearValue] = useState(date?.year.value ?? '')
  const [yearBroken, setYearBroken] = useState(date?.year.isBroken ?? false)
  const [yearUncertain, setYearUncertain] = useState(
    date?.year.isUncertain ?? false
  )
  const [monthValue, setMonthValue] = useState(date?.month.value ?? '')
  const [isIntercalary, setIntercalary] = useState(
    date?.month.isIntercalary ?? false
  )
  const [monthBroken, setMonthBroken] = useState(date?.month.isBroken ?? false)
  const [monthUncertain, setMonthUncertain] = useState(
    date?.month.isUncertain ?? false
  )
  const [dayValue, setDayValue] = useState(date?.day.value ?? '')
  const [dayBroken, setDayBroken] = useState(date?.day.isBroken ?? false)
  const [dayUncertain, setDayUncertain] = useState(
    date?.day.isUncertain ?? false
  )

  function getDate(): MesopotamianDate {
    return MesopotamianDate.fromJson({
      year: {
        value: isAssyrianDate ? '1' : yearValue,
        isBroken: isAssyrianDate ? undefined : yearBroken,
        isUncertain: isAssyrianDate ? undefined : yearUncertain,
      },
      month: {
        value: monthValue,
        isIntercalary,
        isBroken: monthBroken,
        isUncertain: monthUncertain,
      },
      day: { value: dayValue, isBroken: dayBroken, isUncertain: dayUncertain },
      king: king && !isSeleucidEra && !isAssyrianDate ? king : undefined,
      eponym: eponym && isAssyrianDate ? eponym : undefined,
      isSeleucidEra: isSeleucidEra,
      isAssyrianDate: isAssyrianDate,
      ur3Calendar:
        ur3Calendar && isCalendarFieldDisplayed ? ur3Calendar : undefined,
    })
  }

  const saveDateDefault = (updatedDate?: MesopotamianDate): void => {
    if (updatedDate !== date) {
      cancelUpdatePromise()
      setIsSaving(true)
      setUpdatePromise(
        updateDate(updatedDate, index)
          .then(() => {
            setIsDisplayed(false)
          })
          .then(() => setIsSaving(false))
          .then(() => setDate(updatedDate))
      )
    }
  }

  const saveDate = saveDateOverride ?? saveDateDefault
  return {
    yearValue,
    yearBroken,
    yearUncertain,
    monthValue,
    monthBroken,
    monthUncertain,
    dayValue,
    dayBroken,
    dayUncertain,
    king,
    eponym,
    isIntercalary,
    isAssyrianDate,
    isSeleucidEra,
    isCalendarFieldDisplayed,
    ur3Calendar,
    setYearValue,
    setYearBroken,
    setYearUncertain,
    setMonthValue,
    setMonthBroken,
    setMonthUncertain,
    setIntercalary,
    setDayValue,
    setDayBroken,
    setDayUncertain,
    setKing,
    setEponym,
    setIsSeleucidEra,
    setIsAssyrianDate,
    setIsCalenderFieldDisplayed,
    setUr3Calendar,
    getDate,
    saveDate,
  }
}
