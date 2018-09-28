import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import TransliterationSearch from './TransliterationSearch'
import { factory } from 'factory-girl'
import _ from 'lodash'

const transliteration = 'ma i-ra\nka li'
let fragments
let fragmentService
let element

beforeEach(async () => {
  fragmentService = {
    searchTransliteration: jest.fn()
  }
  fragments = await factory.buildMany('fragment', 2, [
    { matching_lines: [['line 1', 'line 2']] },
    { matching_lines: [['line 3'], ['line 4']] }
  ])
  fragmentService.searchTransliteration.mockReturnValueOnce(Promise.resolve(fragments))
  element = render(
    <MemoryRouter>
      <TransliterationSearch transliteration={transliteration} fragmentService={fragmentService} />
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(fragments[0]._id))
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.searchTransliteration).toBeCalledWith(transliteration)
})

it('Links results', () => {
  for (let fragment of fragments) {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  }
})

it('Displays script', () => {
  for (let fragment of fragments) {
    expect(element.queryByText(fragment.script)).not.toBeNull()
  }
})

it('Displays matching lines', () => {
  for (let line of _.flatMapDeep(fragments, 'matching_lines')) {
    expect(element.getByText(line)).not.toBeNull()
  }
})
