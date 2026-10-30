import { routerFutureFlags } from './routerFutureFlags.testSupport'
import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryItem } from 'query/QueryResult'
import { Fragment } from 'fragmentarium/domain/fragment'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import {
  fragmentService,
  dossiersService,
  wordService,
  renderFragmentLines,
  resetFragmentLineMocks,
} from './ExpandableFragmentMatches.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

describe('expanding Library matching lines: guards', () => {
  it('does not offer expansion beyond an exact matching-line total', () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 99],
        matchCount: 2,
        totalMatchingLines: 2,
        fragment: withPreviewLines(base, [
          previewLine(1, []),
          previewLine(2, []),
        ]),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    expect(
      screen.queryByRole('button', { name: /more matching lines/ }),
    ).not.toBeInTheDocument()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('keeps the preview when returned indexes contain no additional text line', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, [])]
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 99],
        matchCount: 3,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, lines),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Additional matching lines are unavailable.',
    )
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(
      screen.queryByRole('button', { name: /more matching lines/ }),
    ).not.toBeInTheDocument()
  })

  it('ignores a request from a card removed by page navigation', async () => {
    const first = fragmentFactory.build({
      number: 'Page.One',
      hasPhoto: false,
      dossiers: [],
    })
    const second = fragmentFactory.build({
      number: 'Page.Two',
      hasPhoto: false,
      dossiers: [],
    })
    const lines = [previewLine(1, []), previewLine(2, [])]
    let resolveRequest: (value: Fragment) => void = () => undefined
    fragmentService.find.mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveRequest = resolve
      }),
    )
    const item = (base: Fragment): QueryItem => ({
      museumNumber: base.number,
      matchingLines: [0, 1],
      matchCount: 2,
      totalMatchingLines: 2,
      fragment: withPreviewLines(base, lines.slice(0, 1)),
      cardSummary: createFragmentCardSummary(),
    })
    const page = (key: string, base: Fragment) => (
      <MemoryRouter future={routerFutureFlags}>
        <DictionaryContext.Provider value={wordService}>
          <FragmentLines
            key={key}
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(base)}
            linesToShow={1}
          />
        </DictionaryContext.Provider>
      </MemoryRouter>
    )
    const view = render(page('first', first))
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    view.rerender(page('second', second))
    await act(async () => {
      resolveRequest(withPreviewLines(first, lines))
    })

    expect(screen.getByRole('link', { name: second.number })).toBeVisible()
    expect(
      screen.queryByRole('link', { name: first.number }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })
})
