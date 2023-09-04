import React from 'react'
import { MesopotamianDate } from 'fragmentarium/domain/Date'

type Props = {
  date: MesopotamianDate
}

export default function DateDisplay({ date }: Props): JSX.Element {
  return (
    <div className="mesopotamian-date-display" role="time">
      {date
        .toString()
        .split('?')
        .map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <sup>?</sup>}
          </React.Fragment>
        ))}
    </div>
  )
}
