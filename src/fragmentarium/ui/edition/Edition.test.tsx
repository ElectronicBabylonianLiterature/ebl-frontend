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
let updateEdition
let container: HTMLElement

jest.mock('fragmentarium/application/FragmentSearchService')

const renderWithRouter = (children: React.ReactNode) =>
  render(<MemoryRouter>{children}</MemoryRouter>)

const setup = () => {
  updateEdition = jest.fn().mockReturnValue(Promise.resolve())
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  fragment = fragmentFactory.build({ atf: '1. ku' })

  const onToggle = jest.fn()
  const isColumnVisible = true

  container = renderWithRouter(
    <Edition
      fragment={fragment}
      fragmentSearchService={fragmentSearchService}
      updateEdition={updateEdition}
      onToggle={onToggle}
      isColumnVisible={isColumnVisible}
    />,
  ).container
}

it('Renders header', () => {
  setup()
  expect(container).toHaveTextContent(fragment.publication)
})

xit('Renders transliteration field', () => {
  expect(screen.getByLabelText('Transliteration')).toHaveValue(fragment.atf)
})

xit('Renders notes field', () => {
  expect(screen.getByLabelText('Notes')).toEqual(fragment.notes)
})

it('Calls updateEdition on save', () => {
  setup()
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateEdition).toHaveBeenCalled()
})
