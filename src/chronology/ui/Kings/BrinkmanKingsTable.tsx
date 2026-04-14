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

function getDynastyId(dynastyName: string): string {
  return `dynasty-${dynastyName.replace(/\s+/g, '-').toLowerCase()}`
}

function DynastyIndex(): JSX.Element {
  return (
    <nav className="kings-tool__index-nav">
      {brinkmanDynasties.map((dynastyName, index) => (
        <a
          key={dynastyName}
          href={`#${getDynastyId(dynastyName)}`}
          className="kings-tool__index-link"
          onClick={(event) => {
            event.preventDefault()
            document
              .getElementById(getDynastyId(dynastyName))
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {index + 1}. {dynastyName}
        </a>
      ))}
    </nav>
  )
}

export default function ListOfKings(): JSX.Element {
  return (
    <section className="kings-tool">
      <div className="kings-tool__intro">
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
      </div>
      <DynastyIndex />
      <BrinkmanKingsTable />
    </section>
  )
}

function BrinkmanKingsTable(): JSX.Element {
  return (
    <Table className="table-borderless chronology-display kings-tool__table">
      <thead>
        <tr>
          <th scope="col" className="kings-tool__column-header">
            No.
          </th>
          <th scope="col" className="kings-tool__column-header">
            King
          </th>
          <th scope="col" className="kings-tool__column-header">
            Dates and Notes
          </th>
        </tr>
      </thead>
      <tbody>
        {brinkmanDynasties.map((dynastyName, index) =>
          getDynasty(dynastyName, index, true),
        )}
      </tbody>
    </Table>
  )
}

function getDynasty(
  dynastyName: string,
  dynastyIndex: number,
  brinkmanOnly = false,
): JSX.Element {
  const _kings = getKingsByDynasty(dynastyName).filter((king) =>
    brinkmanOnly ? !king.isNotInBrinkman : true,
  )
  const groups = _.countBy(_kings, 'groupWith')
  const kingsTags = _kings.map((king) => getKing(king, groups))
  return (
    <Fragment key={dynastyName}>
      <tr key={dynastyName} id={getDynastyId(dynastyName)}>
        <td
          key={`${dynastyName}_title`}
          className="chronology-display__section kings-tool__dynasty"
          colSpan={3}
        >
          <h3 className="kings-tool__dynasty-title">{`${dynastyIndex + 1}. ${dynastyName}`}</h3>
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
      <td
        className="chronology-display kings-tool__index"
        key={`${king.orderGlobal}_index`}
      >
        {king.orderInDynasty}
      </td>
      <td
        className="chronology-display kings-tool__name"
        key={`${king.orderGlobal}_name`}
      >
        {king.name}
      </td>
      {!king.groupWith && (
        <td
          className="chronology-display kings-tool__date"
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
          <Popover.Body>{king.notes}</Popover.Body>
        </Popover>
      }
    />
  )
}
