import React, { Fragment } from 'react'
import _ from 'lodash'
import 'chronology/ui/BrinkmanKings/BrinkmanKings.sass'
//import brinkmanKings from 'chronology/domain/BrinkmanKings.json'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import Select, { ValueType } from 'react-select'
import { KingDateField } from 'chronology/domain/DateBase'
import KingsService from 'chronology/application/KingsService'

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

// ToDo:
// Ensure that the data is correctly passed.
// Perhaps it would make sense to create a class
// which fetches the kings once on initiation,
// then computes the rest of the variables.
export class KingsCollection {
  readonly kings: readonly King[]
  readonly dynasties: readonly string[]

  constructor(kings: readonly King[]) {
    this.kings = kings
    this.dynasties = _.uniq(_.map(this.kings, 'dynastyName'))
  }
}

export function KingField({
  king,
  setKing,
  setIsCalenderFieldDisplayed,
  kingsService,
}: {
  readonly king?: King | KingDateField
  readonly setKing: React.Dispatch<React.SetStateAction<King | undefined>>
  readonly setIsCalenderFieldDisplayed?: React.Dispatch<
    React.SetStateAction<boolean>
  >
  kingsService: KingsService
}): JSX.Element {
  return (
    <Select
      aria-label="select-king"
      options={kingsService.kingOptions}
      onChange={(option) =>
        onKingFieldChange(option, setKing, setIsCalenderFieldDisplayed)
      }
      isSearchable={true}
      autoFocus={true}
      placeholder="King"
      value={
        king ? getCurrentKingOption(kingsService.kingOptions, king) : undefined
      }
    />
  )
}

export function findKingByOrderGlobal(
  orderGlobal: number,
  brinkmanKings: King[]
): King | null {
  const king = _.find(brinkmanKings, ['orderGlobal', orderGlobal])
  return king ?? null
}

function getNoteTrigger(king: King): JSX.Element {
  return (
    <HelpTrigger
      placement="top"
      overlay={
        <Popover id={`${king.orderGlobal}_note`} title="Search References">
          <Popover.Content>{king.notes}</Popover.Content>
        </Popover>
      }
    />
  )
}

export function getDynasty(
  dynastyName: string,
  dynastyIndex: number,
  kings: readonly King[],
  brinkmanOnly = false
): JSX.Element {
  const _kings = getKingsByDynasty(dynastyName, kings).filter((king) =>
    brinkmanOnly ? !king.isNotInBrinkman : true
  )
  const groups = _.countBy(_kings, 'groupWith')
  const kingsTags = _kings.map((king) => getKing(king, groups))
  return (
    <Fragment key={dynastyName}>
      <tr key={dynastyName}>
        <td
          key={`${dynastyName}_title`}
          className="chronology-display__section"
          colSpan={3}
        >
          <h3>{`${dynastyIndex + 1}. ${dynastyName}`}</h3>
        </td>
      </tr>
      {kingsTags}
    </Fragment>
  )
}

function getKing(king: King, groups): JSX.Element {
  const rowSpan = groups[king.orderGlobal] ? groups[king.orderGlobal] + 1 : 1
  return (
    <tr className="kings" key={king.orderGlobal}>
      <td className="chronology-display" key={`${king.orderGlobal}_index`}>
        {king.orderInDynasty}
      </td>
      <td className="chronology-display" key={`${king.orderGlobal}_name`}>
        {king.name}
      </td>
      {!king.groupWith && (
        <td
          className="chronology-display"
          key={`${king.orderGlobal}_date`}
          rowSpan={rowSpan}
        >
          {`${king.date}`} {king.totalOfYears && `(${king.totalOfYears})`}{' '}
          {king.notes && getNoteTrigger(king)}
        </td>
      )}
    </tr>
  )
}

const onKingFieldChange = (
  option: ValueType<{ label: string; value: King }, false>,
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>,
  setIsCalenderFieldDisplayed?: React.Dispatch<React.SetStateAction<boolean>>
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

function getCurrentKingOption(
  kingOptions: {
    label: string
    value: King
  }[],
  king?: King | KingDateField
): { label: string; value: King } | undefined {
  if (king && ('isBroken' in king || 'isUncertain' in king)) {
    const { isBroken, isUncertain, ..._king } = king
    king = _king
  }
  return kingOptions.find((kingOption) => _.isEqual(kingOption.value, king))
}

function getKingsByDynasty(
  dynastyName: string,
  BrinkmanKings: readonly King[]
): King[] | KingDateField[] {
  return _.filter(BrinkmanKings, ['dynastyName', dynastyName])
}
