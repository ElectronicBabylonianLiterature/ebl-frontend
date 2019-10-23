import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Record from './Record'
import moment from 'moment'

let record
let element
let container

describe('Record has entries', () => {
  beforeEach(async () => {
    record = await factory.buildMany('record', 3)
    element = render(<Record record={record} />)
    container = element.container
  })

  it(`Renders all entries`, () => {
    for (const entry of record) {
      const expectedEntry = `${entry.user} (${
        entry.type
      }, ${entry.moment.format('D/M/YYYY')})`
      expect(container).toHaveTextContent(expectedEntry)
    }
  })

  it(`Entries have correct datetTime`, () => {
    for (const entry of record) {
      expect(
        element.getByText(entry.moment.format('D/M/YYYY'))
      ).toHaveAttribute('datetime', entry.moment.format('YYYY-MM-DD'))
    }
  })
})

describe('Record is empty', () => {
  beforeEach(() => {
    container = render(<Record record={[]} />).container
  })

  it(`Shows no record text`, () => {
    expect(container).toHaveTextContent('No record')
  })
})

describe('Historical transliteration', () => {
  const start = moment('1975-02-09')
  const end = moment('1981-10-28')
  const years = [start, end].map(date => date.format('YYYY'))
  let entry

  beforeEach(async () => {
    entry = await factory.build('historicalRecord', {
      date: `${start.toISOString()}/${end.toISOString()}`
    })
    element = render(<Record record={[entry]} />)
    container = element.container
  })

  it('Renders correctly', () => {
    const expectedEntry = `${entry.user} (Transliteration, ${years.join('–')})`
    expect(container).toHaveTextContent(expectedEntry)
  })

  it(`Entries have correct range `, () => {
    for (const year of years) {
      expect(element.getByText(year)).toHaveAttribute('datetime', year)
    }
  })
})
