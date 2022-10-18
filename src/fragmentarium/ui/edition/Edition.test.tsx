import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import Edition from './Edition'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

let fragment: Fragment
let fragmentSearchService
let updateTransliteration
let updateIntroduction
let container: HTMLElement

jest.mock('fragmentarium/application/FragmentSearchService')

beforeEach(() => {
  updateTransliteration = jest.fn().mockReturnValue(Promise.resolve())
  updateIntroduction = jest.fn().mockReturnValue(Promise.resolve())
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  fragment = fragmentFactory.build({ atf: '1. ku' })
  container = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentSearchService={fragmentSearchService}
        updateTransliteration={updateTransliteration}
        updateIntroduction={updateIntroduction}
      />
    </MemoryRouter>
  ).container
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

it('Calls updateIntroduction on save', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateIntroduction).toHaveBeenCalled()
})
