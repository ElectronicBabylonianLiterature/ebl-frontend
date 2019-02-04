import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'testHelpers'
import Edition from './Edition'

let fragment
let element
let container
let fragmentService
let onChange

beforeEach(async () => {
  onChange = jest.fn()
  fragmentService = {
    updateTransliteration: jest.fn(),
    isAllowedToRead: () => true,
    isAllowedToTransliterate: () => true
  }
  fragment = await factory.build('fragment', { atf: '1. ku' })
  element = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentService={fragmentService}
        onChange={onChange} />
    </MemoryRouter>)
  container = element.container
})

it(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

xit('Renders transliteration field', () => {
  expect(element.getByLabelText('Transliteration').value).toEqual(fragment.atf)
})

xit('Renders notes field', () => {
  expect(element.getByLabelText('Notes')).toEqual(fragment.notes)
})

it('Calls onChange on save', async () => {
  fragmentService.updateTransliteration.mockReturnValueOnce(Promise.resolve())

  await submitFormByTestId(element, 'transliteration-form')

  expect(onChange).toHaveBeenCalled()
})
