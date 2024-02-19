import React, { Fragment } from 'react'
import { Markdown } from 'common/Markdown'
import Table from 'react-bootstrap/Table'
import _ from 'lodash'
import 'chronology/ui/Kings/Kings.sass'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import {
  King,
  brinkmanDynasties,
  getKingsByDynasty,
} from 'chronology/ui/Kings/Kings'

export default function ListOfKings(): JSX.Element {
  return (
    <>
      <Markdown
        text="The list of kings presented here has been prepared by John A.
              Brinkman. It is the eighth edition of the chronology first published
              as an appendix to A. L. Oppenheim’s *Ancient Mesopotamia* (1964).
              The principal new feature of this edition is the recalculation of
              late-second-millennium dates deriving from the Middle Assyrian lunar
              calendar and the corresponding recalibration of synchronistic
              Babylonian dates, which were based on a lunar-solar calendar,
              including their relationship with a set of known intercalary months
              from the fourteenth and thirteenth centuries. This presentation
              reflects research current in January 2023."
      />
      <BrinkmanKingsTable />
    </>
  )
}

function BrinkmanKingsTable(): JSX.Element {
  return (
    <Table className="table-borderless chronology-display">
      <tbody>
        {brinkmanDynasties.map((dynastyName, index) =>
          getDynasty(dynastyName, index, true)
        )}
      </tbody>
    </Table>
  )
}

function getDynasty(
  dynastyName: string,
  dynastyIndex: number,
  brinkmanOnly = false
): JSX.Element {
  const _kings = getKingsByDynasty(dynastyName).filter((king) =>
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
