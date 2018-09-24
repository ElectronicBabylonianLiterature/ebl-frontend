import React from 'react'
import { render } from 'react-testing-library'
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
    for (let entry of record) {
      const expectedEntry = `${entry.user} (${entry.type}, ${moment(entry.date).format('D/M/YYYY')})`
      expect(container).toHaveTextContent(expectedEntry)
    }
  })

  it(`Entries have correct datetTime`, () => {
    for (let entry of record) {
      expect(element.getByText(moment(entry.date).format('D/M/YYYY')))
        .toHaveAttribute('datetime', moment(entry.date).format('YYYY-MM-DD'))
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
