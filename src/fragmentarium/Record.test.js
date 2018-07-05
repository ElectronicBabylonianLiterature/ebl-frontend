import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import Record from './Record'
import moment from 'moment'

let record
let container
let element

afterEach(cleanup)

beforeEach(async () => {
  record = await factory.buildMany('record', 3)
  element = render(<Record record={record} />)
  container = element.container
})

it(`Renders all entries`, () => {
  for (let entry of record) {
    expect(container).toHaveTextContent(`${entry.user} (${entry.type}, ${moment(entry.date).format('D/M/YYYY')})`)
  }
})
