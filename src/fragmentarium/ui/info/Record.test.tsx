import React from 'react'
import { render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import Record from './Record'
import { recordFactory } from 'test-support/fragment-data-fixtures'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'

let record: RecordEntry[]
let container: HTMLElement

describe('Record has entries', () => {
  beforeEach(async () => {
    record = recordFactory.buildList(3)
    container = render(<Record record={record} />).container
  })

  it(`Renders all entries`, () => {
    for (const entry of record) {
      const expectedEntry = `${entry.user} (${
        entry.type
      }, ${(entry.moment as DateTime).toFormat('d/M/yyyy')})`
      expect(container).toHaveTextContent(expectedEntry)
    }
  })

  it(`Entries have correct datetTime`, () => {
    for (const entry of record) {
      expect(
        screen.getByText((entry.moment as DateTime).toFormat('d/M/yyyy'))
      ).toHaveAttribute(
        'datetime',
        (entry.moment as DateTime).toFormat('yyyy-MM-dd')
      )
    }
  })
})

describe('Record is empty', () => {
  beforeEach(() => {
    render(<Record record={[]} />)
  })

  it(`Shows no record text`, () => {
    expect(screen.getByText('No record')).toBeInTheDocument()
  })
})

describe('Historical transliteration', () => {
  const start = DateTime.fromISO('1975-02-09')
  const end = DateTime.fromISO('1981-10-28')
  const years = [start, end].map((date) => date.toFormat('yyyy'))
  let entry: RecordEntry

  beforeEach(() => {
    entry = recordFactory.historical(`${start.toISO()}/${end.toISO()}`).build()
    container = render(<Record record={[entry]} />).container
  })

  it('Renders correctly', () => {
    const expectedEntry = `${entry.user} (Transliteration, ${years.join('–')})`
    expect(container).toHaveTextContent(expectedEntry)
  })

  it(`Entries have correct range `, () => {
    for (const year of years) {
      expect(screen.getByText(year)).toHaveAttribute('datetime', year)
    }
  })
})
