import React from 'react'
import { render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import Record, { TruncatedRecord } from './Record'
import { recordFactory } from 'test-support/fragment-data-fixtures'
import { MemoryRouter } from 'react-router-dom'

describe('Record has entries', () => {
  it(`Renders all entries`, () => {
    const record = recordFactory.buildList(3)
    const { container } = render(<Record record={record} />)
    for (const entry of record) {
      const expectedEntry = `${entry.user} (${
        entry.type
      }, ${(entry.moment as DateTime).toFormat('d/M/yyyy')})`
      expect(container).toHaveTextContent(expectedEntry)
    }
  })

  it(`Entries have correct datetTime`, () => {
    const record = recordFactory.buildList(3)
    render(<Record record={record} />)
    for (const entry of record) {
      expect(
        screen.getByText((entry.moment as DateTime).toFormat('d/M/yyyy')),
      ).toHaveAttribute(
        'datetime',
        (entry.moment as DateTime).toFormat('yyyy-MM-dd'),
      )
    }
  })
})

describe('Record is empty', () => {
  it(`Shows no record text`, () => {
    render(<Record record={[]} />)
    expect(screen.getByText('No record')).toBeInTheDocument()
  })
})

describe('Historical transliteration', () => {
  const start = DateTime.fromISO('1975-02-09')
  const end = DateTime.fromISO('1981-10-28')
  const years = [start, end].map((date) => date.toFormat('yyyy'))

  it('Renders correctly', () => {
    const entry = recordFactory
      .historical(`${start.toISO()}/${end.toISO()}`)
      .build()
    const { container } = render(<Record record={[entry]} />)
    const expectedEntry = `${entry.user} (Transliteration, ${years.join('–')})`
    expect(container).toHaveTextContent(expectedEntry)
  })

  it(`Entries have correct range `, () => {
    const entry = recordFactory
      .historical(`${start.toISO()}/${end.toISO()}`)
      .build()
    render(<Record record={[entry]} />)
    for (const year of years) {
      expect(screen.getByText(year)).toHaveAttribute('datetime', year)
    }
  })
})

describe('TruncatedRecord', () => {
  it('truncates long record lists', () => {
    const record = recordFactory.buildList(10)
    render(
      <MemoryRouter>
        <TruncatedRecord record={record} number={'Foo.Bar'} />
      </MemoryRouter>,
    )
    expect(screen.getByText('[…]')).toBeInTheDocument()
  })
  it('links to the full record page', () => {
    const record = recordFactory.buildList(10)
    render(
      <MemoryRouter>
        <TruncatedRecord record={record} number={'Foo.Bar'} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/library/Foo.Bar/record',
    )
  })
})
