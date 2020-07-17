import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import { changeValueByLabel } from 'test-support/utils'
import ReferenceSearchForm from './ReferenceSearchForm'

let element
let entry
let onChangePages
let onChangeBibliographyReference
let searchEntry
let fragmentService
let search

beforeEach(async () => {
  onChangePages = jest.fn()
  onChangeBibliographyReference = jest.fn()

  entry = await factory.build('bibliographyEntry')
  searchEntry = await factory.build('bibliographyEntry')
  search = jest.fn()
  search.mockReturnValue(Promise.resolve([searchEntry]))
  fragmentService = {
    searchBibliography: search,
  }
  element = render(
    <MemoryRouter>
      <ReferenceSearchForm
        onChangePages={onChangePages}
        onChangeBibliographyReference={onChangeBibliographyReference}
        valueBibReference={entry}
        valuePages={''}
        fragmentService={fragmentService}
      />
    </MemoryRouter>
  )
})

it('Calls onChange on User Input', async () => {
  changeValueByLabel(element, 'Pages', '254')
  expect(onChangePages).toBeCalledWith('254')
})

it('Displays the entry label', () => {
  expect(element.container).toHaveTextContent(entry.title)
})
