import React, { Fragment } from 'react'

import Table from 'react-bootstrap/Table'
import _ from 'lodash'
import 'chronology/ui/BrinkmanKings.sass'
import BrinkmanKings from 'chronology/domain/BrinkmanKings.json'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import Select, { ValueType } from 'react-select'

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
}

const dynasties: string[] = _.uniq(_.map(BrinkmanKings, 'dynastyName'))

function getKingsByDynasty(dynastyName: string): King[] {
  return _.filter(BrinkmanKings, ['dynastyName', dynastyName])
}

export function findKingsByOrderGlobal(orderGlobal: number): King | null {
  const king = _.find(BrinkmanKings, ['orderGlobal', orderGlobal])
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

function getDynasty(dynastyName: string, dynastyIndex: number): JSX.Element {
  const kings = getKingsByDynasty(dynastyName)
  const groups = _.countBy(kings, 'groupWith')
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
      {kings.map((king) => getKing(king, groups))}
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

export default function BrinkmanKingsTable(): JSX.Element {
  return (
    <Table className="table-borderless chronology-display">
      <tbody>
        {dynasties.map((dynastyName, index) => getDynasty(dynastyName, index))}
      </tbody>
    </Table>
  )
}

const kingOptions = getKingOptions()

export function KingField({
  king,
  setKing,
  setIsCalenderFieldDisplayed,
}: {
  king?: King
  setKing: React.Dispatch<React.SetStateAction<King | undefined>>
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

function getKingSelectLabel(king: King): string {
  const kingYears = king.date ? ` (${king.date})` : ''
  return `${king.name}${kingYears}, ${king.dynastyName}`
}

function getKingOptions(): Array<{ label: string; value: King }> {
  return BrinkmanKings.filter(
    (king) => !['16', '17'].includes(king.dynastyNumber)
  ).map((king) => {
    return {
      label: getKingSelectLabel(king),
      value: king,
    }
  })
}

function getCurrentKingOption(
  king?: King
): { label: string; value: King } | undefined {
  return kingOptions.find((kingOption) => _.isEqual(kingOption.value, king))
}
