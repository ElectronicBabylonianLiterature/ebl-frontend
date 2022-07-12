import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import Edition from './Edition'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

let fragment: Fragment
let fragmentService
let findInCorpus
let fragmentSearchService
let updateTransliteration
let container: HTMLElement

beforeEach(async () => {
  updateTransliteration = jest.fn()
  updateTransliteration.mockReturnValue(Promise.resolve())
  findInCorpus = jest.fn()
  findInCorpus.mockReturnValue(Promise.resolve([]))
  fragmentService = { findInCorpus: findInCorpus }
  fragmentSearchService = {}
  fragment = fragmentFactory.build({ atf: '1. ku' })
  container = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        updateTransliteration={updateTransliteration}
      />
    </MemoryRouter>
  ).container
  await waitForSpinnerToBeRemoved(screen)
})

it('Renders header', () => {
  expect(container).toHaveTextContent(fragment.publication)
})

xit('Renders transliteration field', () => {
  expect(screen.getByLabelText('Transliteration')).toHaveValue(fragment.atf)
})

xit('Renders notes field', () => {
  expect(screen.getByLabelText('Notes')).toEqual(fragment.notes)
})

it('Calls updateTransliteration on save', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalled()
})
