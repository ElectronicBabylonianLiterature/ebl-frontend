import React from 'react'

import _ from 'lodash'
import { DateTime, Interval } from 'luxon'
import './Record.sass'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import classnames from 'classnames'
import { Link } from 'react-router-dom'

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

function Year({ date }: { date: DateTime | null }) {
  return date ? (
    <Date date={date} humanFormat="yyyy" machineFormat="yyyy" />
  ) : null
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
        <li key={index}>
          <Entry entry={entry} />
        </li>
      ))}
      {_.isEmpty(record) && <li key={'empty-record'}>No record</li>}
    </ol>
  )
}

function LinkToRecord({ number }: { number: string }): JSX.Element {
  return (
    <li key={'full-record-link'}>
      <Link to={`/library/${number}/record`}>
        <span>View full record</span>
        &nbsp;
        <i className={'fas fa-external-link'}></i>
      </Link>
    </li>
  )
}

function InitialEntry({
  record,
}: {
  record: readonly RecordEntry[]
}): JSX.Element {
  return (
    <li key={'first-entry'}>
      <Entry entry={_.first(record) as RecordEntry} />
    </li>
  )
}

function LatestEntries({
  record,
}: {
  record: readonly RecordEntry[]
}): JSX.Element {
  return (
    <>
      {_.takeRight(record, 3).map((entry, index) => (
        <li key={index}>
          <Entry entry={entry} />
        </li>
      ))}
    </>
  )
}

export function TruncatedRecord({
  record,
  className,
  number,
}: {
  record: readonly RecordEntry[]
  className?: string
  number: string
}): JSX.Element {
  return (
    <section>
      <h3>Record</h3>
      {record.length >= 5 ? (
        <ol className={classnames('Record', className)}>
          <InitialEntry record={record} />
          <li key={'ellipsis'}>[…]</li>
          <LatestEntries record={record} />
          <LinkToRecord number={number} />
        </ol>
      ) : (
        <RecordList record={record} className={className} />
      )}
    </section>
  )
}

export default Record
