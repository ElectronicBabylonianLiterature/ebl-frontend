import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { changeValueByLabel } from '../../../test-support/utils'
import ReferenceSearchForm from './ReferenceSearchForm'
import BibliographyEntry from '../../../bibliography/domain/BibliographyEntry'

let element
let entry
let onChange
let getState
let searchEntry
let fragmentService
let search
beforeEach(async () => {
  onChange = jest.fn()

  entry = await factory.build('bibliographyEntry')
  searchEntry = await factory.build('bibliographyEntry')
  search = jest.fn()
  search.mockReturnValue(Promise.resolve([searchEntry]))
  fragmentService = {
    searchBibliography: search,
  }
  getState = jest.fn(() => entry.title)
  element = render(
    <MemoryRouter>
      <ReferenceSearchForm
        onChange={onChange}
        getState={getState}
        fragmentService={fragmentService}
      />
    </MemoryRouter>
  )
})

it('Calls onChange on User Input', async () => {
  changeValueByLabel(element, 'Pages', '254')
  expect(onChange).toBeCalledWith('pages', '254')
})

it('Displays the entry label', () => {
  expect(element.container).toHaveTextContent(entry.title)
})
