import React from 'react'

import _ from 'lodash'
import { DateRange } from 'moment-range'
import './Record.css'
import { RecordEntry } from 'fragmentarium/domain/fragment'
import * as Moment from 'moment'

type EntryProps = {
  entry: RecordEntry
}

interface DateProps {
  date: Moment.Moment
  humanFormat: string
  machineFormat: string
}
function Date({ date, humanFormat, machineFormat }: DateProps): JSX.Element {
  const humanDate = date.format(humanFormat)
  const machineDate = date.format(machineFormat)
  return <time dateTime={machineDate}>{humanDate}</time>
}

function Year({ date }: { date: Moment.Moment }) {
  return <Date date={date} humanFormat="YYYY" machineFormat="YYYY" />
}

function BasicEntry({ entry }: EntryProps) {
  return (
    <>
      {entry.user} ({entry.type},{' '}
      <Date
        date={entry.moment as Moment.Moment}
        humanFormat="D/M/YYYY"
        machineFormat="YYYY-MM-DD"
      />
      )
    </>
  )
}

function HistoricalTransliteration({ entry }: EntryProps) {
  const range = entry.moment as DateRange
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
