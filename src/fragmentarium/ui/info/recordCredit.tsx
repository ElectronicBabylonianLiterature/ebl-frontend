import React from 'react'
import $ from 'jquery'
import { renderToString } from 'react-dom/server'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { RecordList } from 'fragmentarium/ui/info/Record'

export default function recordCredit(record: readonly RecordEntry[]): string {
  const entries = $(renderToString(<RecordList record={record} />))
    .children('li')
    .map((_index, entry) => $(entry).text())
    .get()
  return `Credit: electronic Babylonian Library Project; ${entries.join(', ')}`
}
