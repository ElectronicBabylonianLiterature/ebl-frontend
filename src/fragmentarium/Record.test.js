import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Record from './Record'
import moment from 'moment'

let record
let container

afterEach(cleanup)

describe('Record has entries', () => {
  beforeEach(async () => {
    record = await factory.buildMany('record', 3)
    container = render(<Record record={record} />).container
  })

  it(`Renders all entries`, () => {
    for (let entry of record) {
      expect(container).toHaveTextContent(`${entry.user} (${entry.type}, ${moment(entry.date).format('D/M/YYYY')})`)
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
