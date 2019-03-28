import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-helpers/utils'
import Edition from './Edition'

let fragment
let element
let container
let fragmentService
let updateTransliteration

beforeEach(async () => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())
  fragmentService = {}
  fragment = await factory.build('fragment', { atf: '1. ku' })
  element = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentService={fragmentService}
        updateTransliteration={updateTransliteration} />
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

it('Calls updateTransliteration on save', () => {
  submitFormByTestId(element, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalled()
})
