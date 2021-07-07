import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import Edition from './Edition'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

let fragment: Fragment
let element: RenderResult
let container: HTMLElement
let fragmentSearchService
let updateTransliteration

beforeEach(() => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())
  fragmentSearchService = {}
  fragment = fragmentFactory.build({ atf: '1. ku' })
  element = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentSearchService={fragmentSearchService}
        updateTransliteration={updateTransliteration}
      />
    </MemoryRouter>
  )
  container = element.container
})

it(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

xit('Renders transliteration field', () => {
  expect(
    (element.getByLabelText('Transliteration') as HTMLInputElement).value
  ).toEqual(fragment.atf)
})

xit('Renders notes field', () => {
  expect(element.getByLabelText('Notes')).toEqual(fragment.notes)
})

it('Calls updateTransliteration on save', () => {
  submitFormByTestId(element, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalled()
})
