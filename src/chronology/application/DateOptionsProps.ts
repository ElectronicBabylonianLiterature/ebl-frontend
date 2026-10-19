import React from 'react'
import {
  EponymDateField,
  KingDateField,
  Ur3Calendar,
} from 'chronology/domain/DateParameters'

export interface DateOptionsProps {
  king?: KingDateField
  kingBroken?: boolean
  kingUncertain?: boolean
  eponym?: EponymDateField
  eponymBroken?: boolean
  eponymUncertain?: boolean
  ur3Calendar?: Ur3Calendar
  isSeleucidEra: boolean
  isAssyrianDate: boolean
  isCalendarFieldDisplayed: boolean
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>
  setKingBroken: React.Dispatch<React.SetStateAction<boolean>>
  setKingUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setEponym: React.Dispatch<React.SetStateAction<EponymDateField | undefined>>
  setEponymBroken: React.Dispatch<React.SetStateAction<boolean>>
  setEponymUncertain: React.Dispatch<React.SetStateAction<boolean>>
  setIsSeleucidEra: React.Dispatch<React.SetStateAction<boolean>>
  setIsAssyrianDate: React.Dispatch<React.SetStateAction<boolean>>
  setIsCalenderFieldDisplayed: React.Dispatch<React.SetStateAction<boolean>>
  setUr3Calendar: React.Dispatch<React.SetStateAction<Ur3Calendar | undefined>>
}
