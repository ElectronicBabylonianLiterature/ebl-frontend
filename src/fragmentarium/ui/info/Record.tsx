import React from 'react'

import _ from 'lodash'
import { DateTime, Interval } from 'luxon'
import './Record.css'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'

type EntryProps = {
  entry: RecordEntry
}

interface DateProps {
  date: DateTime
  humanFormat: string
  machineFormat: string
}
function Date({ date, humanFormat, machineFormat }: DateProps): JSX.Element {
  const humanDate = date.toFormat(humanFormat)
  const machineDate = date.toFormat(machineFormat)
  return <time dateTime={machineDate}>{humanDate}</time>
}

function Year({ date }: { date: DateTime }) {
  return <Date date={date} humanFormat="yyyy" machineFormat="yyyy" />
}

function BasicEntry({ entry }: EntryProps) {
  return (
    <>
      {entry.user} ({entry.type},{' '}
      <Date
        date={entry.moment as DateTime}
        humanFormat="d/M/yyyy"
        machineFormat="yyyy-MM-dd"
      />
      )
    </>
  )
}

function HistoricalTransliteration({ entry }: EntryProps) {
  const range = entry.moment as Interval
  return (
    <>
      {entry.user} (Transliteration, <Year date={range.start} />–
      <Year date={range.end} />)
    </>
  )
}

function Entry({ entry }: EntryProps) {
  return entry.isHistorical ? (
    <HistoricalTransliteration entry={entry} />
  ) : (
    <BasicEntry entry={entry} />
  )
}

function Record({
  record,
}: {
  record: ReadonlyArray<RecordEntry>
}): JSX.Element {
  return (
    <section>
      <h3>Record</h3>
      <ol className="Record">
        {record.map((entry, index) => (
          <li className="Record__entry" key={index}>
            <Entry entry={entry} />
          </li>
        ))}
        {_.isEmpty(record) && <li className="Record__entry">No record</li>}
      </ol>
    </section>
  )
}

export default Record
