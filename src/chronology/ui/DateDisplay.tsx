import React, { useState, ReactElement, Fragment } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

interface Props {
  date: MesopotamianDate
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
  const parsedDate: string = date.toString()
  const match = parsedDate.match(/(.*) \((.*) BCE PJC \| (.*) BCE PGC\)/)
  const dateString = match ? match[1] : parsedDate
  const pjcDate = match ? `${match[2]} BCE` : ''
  const pgcDate = match ? `${match[3]} BCE` : ''
  const isDateSwitchable = Boolean(match)
  const tooltipMessage =
    modernCalendar === 'PJC'
      ? 'Switch to Proleptic Gregorian Calendar'
      : 'Switch to Proleptic Julian Calendar'

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
