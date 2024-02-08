import React, { useState } from 'react'
import { MesopotamianDate } from 'chronology/domain/Date'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

type Props = {
  date: MesopotamianDate
}

const DateDisplay: React.FC<Props> = ({ date }) => {
  const [calendarType, setCalendarType] = useState('PJC')
  const toggleCalendar = () => {
    setCalendarType(calendarType === 'PJC' ? 'PGC' : 'PJC')
  }

  const parsedDate = date.toString()
  let seDate = parsedDate
  let pjcDate = ''
  let pgcDate = ''
  let isDateSwitchable = true

  const match = parsedDate.match(/(.*) \((.*) BCE PJC \| (.*) BCE PGC\)/)
  if (match) {
    seDate = match[1]
    pjcDate = match[2] + ' BCE'
    pgcDate = match[3] + ' BCE'
  } else {
    isDateSwitchable = false
  }

  const formatSeDate = (seDateString) => {
    return seDateString.split('?').map((part, index, array) => (
      <React.Fragment key={index}>
        {part}
        {index < array.length - 1 && <sup>?</sup>}
      </React.Fragment>
    ))
  }

  const tooltipMessage =
    calendarType === 'PJC'
      ? 'Switch to Proleptic Gregorian Calendar'
      : 'Switch to Proleptic Julian Calendar'

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {tooltipMessage}
    </Tooltip>
  )

  function getSwitchableDate(): JSX.Element {
    return (
      <>
        {' '}
        ({calendarType === 'PJC' ? pjcDate : pgcDate}{' '}
        <OverlayTrigger placement="top" overlay={renderTooltip}>
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
            {calendarType}
          </span>
        </OverlayTrigger>
        )
      </>
    )
  }

  return (
    <div className="mesopotamian-date-display" role="time">
      {formatSeDate(seDate)}
      {isDateSwitchable && getSwitchableDate()}
    </div>
  )
}

export default DateDisplay
