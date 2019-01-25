import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'

import { whenChangedByLabel } from 'testHelpers'
import ReferenceForm from './ReferenceForm'

let reference
let element
let onChange

beforeEach(async () => {
  reference = await factory.build('reference')
  onChange = jest.fn()
  element = render(<ReferenceForm value={reference} onChange={onChange} />)
})

describe.each([
  ['ID', 'id', 'new id'],
  ['Pages', 'pages', '3'],
  ['Type', 'type', 'EDITION'],
  ['Notes', 'notes', 'new notes']
])('%s', (label, property, newValue) => {
  it(`Has correct label and value`, () => {
    expect(element.getByLabelText(label).value).toEqual(reference[property])
  })

  it(`Calls onChange with updated value`, async () => {
    await whenChangedByLabel(element, label, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith(updatedItem => ({ ...reference, [property]: updatedItem }))
  })
})

it('Displays Lines Cited', () => {
  expect(element.getByLabelText('Lines Cited').value).toEqual(reference.linesCited.join(','))
})

it(`Calls onChange with updated Lines Cited`, async () => {
  await whenChangedByLabel(element, 'Lines Cited', '3.1,2')
    .expect(onChange)
    .toHaveBeenCalledWith(updatedItem => ({ ...reference, linesCited: updatedItem.split(',') }))
})
