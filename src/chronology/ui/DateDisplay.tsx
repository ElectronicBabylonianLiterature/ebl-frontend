import React, { useState, ReactElement, Fragment } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

interface Props {
  date: MesopotamianDate
}

interface DateDisplayParams {
  dateString: string
  pjcDate: string
  pgcDate: string
  isDateSwitchable: boolean
  tooltipMessage: string
}

function getDateDisplayParams(
  date: MesopotamianDate,
  modernCalendar: 'PJC' | 'PGC',
): DateDisplayParams {
  const parsedDate: string = date.toString()
  const match = parsedDate.match(/(.*) \((.*) PJC \| (.*) PGC\)/)
  const dateString = match ? match[1] : parsedDate
  const pjcDate = match ? match[2] : ''
  const pgcDate = match ? match[3] : ''
  const isDateSwitchable = Boolean(match)
  const tooltipMessage =
    modernCalendar === 'PJC'
      ? 'Switch to Proleptic Gregorian Calendar'
      : 'Switch to Proleptic Julian Calendar'

  return {
    dateString,
    pjcDate,
    pgcDate,
    isDateSwitchable,
    tooltipMessage,
  }
}

const formatDateString = (dateString: string): ReactElement[] => {
  return dateString.split('?').map((part, index, array) => (
    <Fragment key={index}>
      {part}
      {index < array.length - 1 && <sup>?</sup>}
    </Fragment>
  ))
}

const getSwitchableDate = ({
  modernCalendar,
  pjcDate,
  pgcDate,
  tooltipMessage,
  toggleCalendar,
}: {
  modernCalendar: 'PJC' | 'PGC'
  pjcDate: string
  pgcDate: string
  tooltipMessage: string
  toggleCalendar: () => void
}): ReactElement => (
  <>
    {' '}
    ({modernCalendar === 'PJC' ? pjcDate : pgcDate}{' '}
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip id="button-tooltip">{tooltipMessage}</Tooltip>}
    >
      <span
        onClick={toggleCalendar}
        role="button"
        tabIndex={0}
        style={{
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          cursor: 'pointer',
        }}
      >
        {modernCalendar}
      </span>
    </OverlayTrigger>
    )
  </>
)

const DateDisplay: React.FC<Props> = ({ date }): ReactElement => {
  const [modernCalendar, setModernCalendar] = useState<'PJC' | 'PGC'>('PJC')
  const toggleCalendar = (): void => {
    setModernCalendar((prev) => (prev === 'PJC' ? 'PGC' : 'PJC'))
  }
  const { dateString, pjcDate, pgcDate, isDateSwitchable, tooltipMessage } =
    getDateDisplayParams(date, modernCalendar)
  return (
    <div className="mesopotamian-date-display" role="time">
      {formatDateString(dateString)}
      {isDateSwitchable &&
        getSwitchableDate({
          modernCalendar,
          pjcDate,
          pgcDate,
          tooltipMessage,
          toggleCalendar,
        })}
    </div>
  )
}

export default DateDisplay
