import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import TransliterationSearch from './TransliterationSearch'
import { factory } from 'factory-girl'
import _ from 'lodash'

const transliteration = 'ma i-ra\nka li'
let fragments
let fragmentSearchService
let element

beforeEach(async () => {
  fragmentSearchService = {
    searchTransliteration: jest.fn(),
  }
  fragments = await factory.buildMany('fragmentInfo', 2, [
    { matchingLines: [['line 1', 'line 2']] },
    { matchingLines: [['line 3'], ['line 4']] },
  ])
  fragmentSearchService.searchTransliteration.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <TransliterationSearch
        transliteration={transliteration}
        fragmentSearchService={fragmentSearchService}
      />
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(fragments[0].number))
})

it('Queries the API with given parameters', () => {
  expect(fragmentSearchService.searchTransliteration).toBeCalledWith(
    transliteration
  )
})

it('Links results', () => {
  for (const fragment of fragments) {
    expect(element.getByText(fragment.number)).toHaveAttribute(
      'href',
      `/fragmentarium/${fragment.number}`
    )
  }
})

it('Displays script', () => {
  for (const fragment of fragments) {
    expect(element.getAllByText(fragment.script)).not.toEqual([])
  }
})

it('Displays matching lines', () => {
  for (const line of _.flatMapDeep(
    fragments,
    (fragment) => fragment.matchingLines
  )) {
    expect(element.getAllByText(line)).not.toEqual([])
  }
})
