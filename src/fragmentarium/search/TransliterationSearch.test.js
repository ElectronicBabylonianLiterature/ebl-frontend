import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import TransliterationSearch from './TransliterationSearch'
import { factory } from 'factory-girl'
import { fromJS, Seq } from 'immutable'

const transliteration = 'ma i-ra\nka li'
let fragments
let fragmentService
let element

beforeEach(async () => {
  fragmentService = {
    searchTransliteration: jest.fn()
  }
  fragments = await factory.buildMany('fragment', 2, [
    { matchingLines: fromJS([['line 1', 'line 2']]) },
    { matchingLines: fromJS([['line 3'], ['line 4']]) }
  ])
  fragmentService.searchTransliteration.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <TransliterationSearch
        transliteration={transliteration}
        fragmentService={fragmentService}
      />
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(fragments[0].number))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.searchTransliteration).toBeCalledWith(transliteration)
})

it('Links results', () => {
  for (let fragment of fragments) {
    expect(element.getByText(fragment.number)).toHaveAttribute(
      'href',
      `/fragmentarium/${fragment.number}`
    )
  }
})

it('Displays script', () => {
  for (let fragment of fragments) {
    expect(element.queryByText(fragment.script)).not.toBeNull()
  }
})

it('Displays matching lines', () => {
  for (let line of Seq(fragments)
    .map(fragment => fragment.matchingLines)
    .flatten(false)) {
    expect(element.getByText(line)).not.toBeNull()
  }
})
