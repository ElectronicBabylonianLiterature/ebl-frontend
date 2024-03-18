import React from 'react'

import _ from 'lodash'
import { DateTime, Interval } from 'luxon'
import './Record.css'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

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
  const history = useHistory()
  const displayRecords =
    record.length > 4 ? [record[0], ...record.slice(-3)] : record
  const handleViewFullHistoryClick = () => {
    history.push('/records')
  }

  const recordListWithButton = (
    <>
      {displayRecords.map((entry, index) => (
        <li className="Record__entry" key={index}>
          <Entry entry={entry} />
        </li>
      ))}
      <li className="Record__entry">
        <button
          onClick={handleViewFullHistoryClick}
          style={{
            backgroundColor: '#CCCCCC',
            color: '#0056B3',
            padding: '2px 4px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '9px',
          }}
        >
          View Full Edit History
        </button>
      </li>
    </>
  )

  return (
    <section>
      <h3>Record</h3>
      <ol className="Record">{recordListWithButton}</ol>
    </section>
  )
}

export function RecordList({
  record,
  className,
}: {
  record: readonly RecordEntry[]
  className?: string
}): JSX.Element {
  return (
    <ol className={classnames('Record', className)}>
      {record.map((entry, index) => (
        <li className="Record__entry" key={index}>
          <Entry entry={entry} />
        </li>
      ))}
      {_.isEmpty(record) && <li className="Record__entry">No record</li>}
    </ol>
  )
}

export default Record
