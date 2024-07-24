import React, { useState } from 'react'

import _ from 'lodash'
import { DateTime, Interval } from 'luxon'
import './Record.css'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import classnames from 'classnames'

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
      <RecordList record={record} />
    </section>
  )
}

function RecordListEntry({ entry }: { entry: RecordEntry }): JSX.Element {
  return (
    <li className="Record__entry">
      <Entry entry={entry} />
    </li>
  )
}

export function ExpandableList({
  children,
}: {
  children: JSX.Element[]
}): JSX.Element {
  const [isOpen, setOpen] = useState(false)
  return isOpen ? (
    <>{children}</>
  ) : (
    <button onClick={() => setOpen(true)}>...</button>
  )
}

function TruncatedRecordList({
  record,
  className,
  previewSize = 3,
}: {
  record: readonly RecordEntry[]
  className?: string
  previewSize: number
}): JSX.Element {
  const first = record[0]
  // const hidden = record.slice(1, record.length - previewSize)
  const preview = _.takeRight(record, previewSize)
  return (
    <ol className={classnames('Record', className)}>
      <RecordListEntry entry={first} />
      <li className="Record__entry">...</li>
      {preview.map((entry, index) => (
        <RecordListEntry entry={entry} key={index} />
      ))}
    </ol>
  )
}

export function RecordList({
  record,
  className,
}: {
  record: readonly RecordEntry[]
  className?: string
}): JSX.Element {
  const maxLength = 5
  const recordSize = record.length
  return (
    <ol className={classnames('Record', className)}>
      {recordSize > maxLength ? (
        <TruncatedRecordList
          record={record}
          className={className}
          previewSize={3}
        />
      ) : (
        record.map((entry, index) => (
          <li className="Record__entry" key={index}>
            <Entry entry={entry} />
          </li>
        ))
      )}
      {recordSize === 0 && <li className="Record__entry">No record</li>}
    </ol>
  )
}

export default Record
