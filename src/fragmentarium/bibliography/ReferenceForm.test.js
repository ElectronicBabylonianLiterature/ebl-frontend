import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

// import { whenClicked, changeValueByLabel } from 'testHelpers'
import ReferenceForm from './ReferenceForm'

let reference
let element

beforeEach(async () => {
  reference = await factory.build('reference')
  element = render(<ReferenceForm value={reference} />)
})

it('Displays ID', () => {
  expect(element.getByLabelText('ID').value).toEqual(reference.id)
})

it('Displays Pages', () => {
  expect(element.getByLabelText('Pages').value).toEqual(reference.pages)
})

it('Displays Type', () => {
  expect(element.getByLabelText('Type').value).toEqual(reference.type)
})

it('Displays Notes', () => {
  expect(element.getByLabelText('Notes').value).toEqual(reference.notes)
})

it('Displays Lines Cited', () => {
  expect(element.getByLabelText('Lines Cited').value).toEqual(reference.linesCited.join(','))
})
