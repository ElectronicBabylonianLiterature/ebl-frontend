import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import Promise from 'bluebird'
import TransliterationSearch from './TransliterationSearch'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

const transliteration = 'ma i-ra\nka li'
let fragments: FragmentInfo[]
let fragmentSearchService
let element: RenderResult

beforeEach(async () => {
  fragmentSearchService = {
    searchTransliteration: jest.fn(),
  }
  fragments = [
    fragmentInfoFactory.build(
      {},
      { associations: { matchingLines: [['line 1', 'line 2']] } }
    ),
    fragmentInfoFactory.build(
      {},
      { associations: { matchingLines: [['line 3'], ['line 4']] } }
    ),
  ]
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
  await element.findByText(fragments[0].number)
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
  for (const line of fragments.flatMap((fragment) =>
    fragment.matchingLines.flat()
  )) {
    expect(element.getAllByText(line)).not.toEqual([])
  }
})
