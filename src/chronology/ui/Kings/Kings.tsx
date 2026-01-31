import React from 'react'
import _ from 'lodash'
import 'chronology/ui/Kings/Kings.sass'
import _kings from 'chronology/domain/Kings.json'
import Select, { ValueType } from 'react-select'
import { KingDateField } from 'chronology/domain/DateParameters'

export interface King {
  orderGlobal: number
  groupWith?: number
  dynastyNumber: string
  dynastyName: string
  orderInDynasty: string
  name: string
  date: string
  totalOfYears: string
  notes: string
  isNotInBrinkman?: boolean
}

export const Kings: King[] = _kings
const dynasties: string[] = _.uniq(_.map(Kings, 'dynastyName'))
export const brinkmanDynasties: string[] = dynasties.filter(
  (dynastyName) =>
    !!getKingsByDynasty(dynastyName).every((king) => king.isNotInBrinkman) ===
    false,
)

export function getKingsByDynasty(
  dynastyName: string,
): King[] | KingDateField[] {
  return _.filter(Kings, ['dynastyName', dynastyName])
}

export function findKingByOrderGlobal(orderGlobal: number): King | null {
  const king = _.find(Kings, ['orderGlobal', orderGlobal])
  return king ?? null
}

const kingOptions = getKingOptions()

export function KingField({
  king,
  setKing,
  setIsCalenderFieldDisplayed,
}: {
  king?: King | KingDateField
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>
  setIsCalenderFieldDisplayed?: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {
  return (
    <Select
      aria-label="select-king"
      options={kingOptions}
      onChange={(option) =>
        onKingFieldChange(option, setKing, setIsCalenderFieldDisplayed)
      }
      isSearchable={true}
      autoFocus={true}
      placeholder="King"
      value={king ? getCurrentKingOption(king) : undefined}
    />
  )
}

const onKingFieldChange = (
  option: ValueType<{ label: string; value: King }, false>,
  setKing: React.Dispatch<React.SetStateAction<KingDateField | undefined>>,
  setIsCalenderFieldDisplayed?: React.Dispatch<React.SetStateAction<boolean>>,
): void => {
  setKing(option?.value)
  if (setIsCalenderFieldDisplayed) {
    if (option?.value?.dynastyNumber === '2') {
      setIsCalenderFieldDisplayed(true)
    } else {
      setIsCalenderFieldDisplayed(false)
    }
  }
}

function getKingSelectLabel(king: King): string {
  const kingYears = king.date ? ` (${king.date})` : ''
  return `${king.name}${kingYears}, ${king.dynastyName}`
}

function getKingOptions(): Array<{ label: string; value: King }> {
  return Kings.filter((king) => !['16', '17'].includes(king.dynastyNumber)).map(
    (king) => {
      return {
        label: getKingSelectLabel(king),
        value: king,
      }
    },
  )
}

function getCurrentKingOption(
  king?: King | KingDateField,
): { label: string; value: King } | undefined {
  if (king && ('isBroken' in king || 'isUncertain' in king)) {
    const { isBroken, isUncertain, ..._king } = king
    king = _king
  }
  return kingOptions.find((kingOption) => _.isEqual(kingOption.value, king))
}
