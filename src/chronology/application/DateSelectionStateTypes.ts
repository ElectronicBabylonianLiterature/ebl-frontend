import { MesopotamianDate } from 'chronology/domain/Date'
import {
  EponymDateField,
  Ur3Calendar,
  KingDateField,
} from 'chronology/domain/DateParameters'
import { Fragment } from 'fragmentarium/domain/fragment'

export interface DateEditorStateProps {
  date?: MesopotamianDate
  updateDate: (date?: MesopotamianDate, index?: number) => Promise<Fragment>
  setDate: React.Dispatch<React.SetStateAction<MesopotamianDate | undefined>>
  setIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setSaveError: React.Dispatch<React.SetStateAction<Error | null>>
  index?: number
  saveDateOverride?: (updatedDate?: MesopotamianDate, index?: number) => void
}

export interface YearStateParams {
  yearValue: string
  yearBroken: boolean
  yearUncertain: boolean
  yearReconstructed: boolean
  yearEmended: boolean
  setYearValue: React.Dispatch<React.SetStateAction<string>>
  setYearBroken: React.Dispatch<React.SetStateAction<boolean>>
  setYearUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setYearReconstructed: React.Dispatch<React.SetStateAction<boolean>>
  setYearEmended: React.Dispatch<React.SetStateAction<boolean>>
}

export interface MonthStateParams {
  monthValue: string
  monthBroken: boolean
  monthUncertain: boolean
  isIntercalary: boolean
  setMonthValue: React.Dispatch<React.SetStateAction<string>>
  setMonthBroken: React.Dispatch<React.SetStateAction<boolean>>
  setMonthUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIntercalary: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DayStateParams {
  dayValue: string
  dayBroken: boolean
  dayUncertain: boolean
  setDayValue: React.Dispatch<React.SetStateAction<string>>
  setDayBroken: React.Dispatch<React.SetStateAction<boolean>>
  setDayUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DateConditionParams {
  isAssyrianDate: boolean
  isSeleucidEra: boolean
  isCalendarFieldDisplayed
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
}

export interface KingAndEponymBrokenUncertainParams {
  kingBroken?: boolean
  kingUncertain?: boolean
  eponymBroken?: boolean
  eponymUncertain?: boolean
  setKingBroken: React.Dispatch<React.SetStateAction<boolean>>
  setKingUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setEponymBroken: React.Dispatch<React.SetStateAction<boolean>>
  setEponymUncertain: React.Dispatch<React.SetStateAction<boolean>>
}

export interface KingAndEponymDateParams extends KingAndEponymBrokenUncertainParams {
  king?: KingDateField
  eponym?: EponymDateField
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>
  setEponym: React.Dispatch<React.SetStateAction<EponymDateField | undefined>>
}

export interface AdditionalDateStateParams
  extends DateConditionParams, KingAndEponymDateParams {
  ur3Calendar: Ur3Calendar | undefined
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}

export interface DateSelectionStateParams
  extends
    YearStateParams,
    MonthStateParams,
    DayStateParams,
    AdditionalDateStateParams {}

export interface DateSelectionState extends DateSelectionStateParams {
  getDate: () => MesopotamianDate
  saveDate:
    | ((
        updatedDate?: MesopotamianDate | undefined,
        index?: number | undefined,
      ) => void)
    | ((updatedDate?: MesopotamianDate) => void)
}
