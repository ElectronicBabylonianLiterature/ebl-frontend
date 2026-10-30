import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
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
  fragmentLinesElement,
  renderFragmentLines,
  resetFragmentLineMocks,
} from './ExpandableFragmentMatches.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

describe('expanding Library matching lines: lifecycle', () => {
  it('offers retry after a failed request', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
    fragmentService.find
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [0, 1, 2],
        matchCount: 3,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, lines.slice(0, 2)),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load matching lines.',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry loading matching lines' }),
    )
    expect(await screen.findByText('3')).toBeVisible()
    expect(fragmentService.find).toHaveBeenCalledTimes(2)
  })

  it('ignores an obsolete response after cancellation or query change', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = [previewLine(1, []), previewLine(2, []), previewLine(3, [])]
    let resolveRequest: (value: Fragment) => void = () => undefined
    fragmentService.find.mockReturnValueOnce(
      new Promise<Fragment>((resolve) => {
        resolveRequest = resolve
      }),
    )
    const firstItem: QueryItem = {
      museumNumber: base.number,
      matchingLines: [0, 1, 2],
      matchCount: 3,
      totalMatchingLines: 3,
      fragment: withPreviewLines(base, lines.slice(0, 2)),
      cardSummary: createFragmentCardSummary(),
    }
    const view = renderFragmentLines(firstItem, 2)

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(
      screen.getByRole('button', { name: 'Loading matching lines…' }),
    ).toBeDisabled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel loading' }),
    )
    const nextItem: QueryItem = {
      ...firstItem,
      matchingLines: [8],
      totalMatchingLines: 1,
      fragment: withPreviewLines(base, [previewLine(9, [])]),
    }
    view.rerender(fragmentLinesElement(nextItem, 2))
    await act(async () => {
      resolveRequest(withPreviewLines(base, lines))
    })

    expect(screen.getByRole('table')).toHaveTextContent('9')
    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })

  it('expands only the clicked card', async () => {
    const first = fragmentFactory.build({
      number: 'First.Fragment',
      hasPhoto: false,
      dossiers: [],
    })
    const second = fragmentFactory.build({
      number: 'Second.Fragment',
      hasPhoto: false,
      dossiers: [],
    })
    const lines = [previewLine(1, []), previewLine(2, [])]
    const item = (base: Fragment): QueryItem => ({
      museumNumber: base.number,
      matchingLines: [0, 1],
      matchCount: 2,
      totalMatchingLines: 2,
      fragment: withPreviewLines(base, lines.slice(0, 1)),
      cardSummary: createFragmentCardSummary(),
    })
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(first, lines))
    render(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(first)}
            linesToShow={1}
          />
          <FragmentLines
            fragmentService={fragmentService}
            dossiersService={dossiersService}
            queryItem={item(second)}
            linesToShow={1}
          />
        </DictionaryContext.Provider>
      </MemoryRouter>,
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    const expandButtons = screen.getAllByRole('button', {
      name: 'Show 1 more matching line',
    })
    expect(expandButtons[0]).toHaveAccessibleDescription(
      'Matching lines in First.Fragment',
    )
    expect(expandButtons[1]).toHaveAccessibleDescription(
      'Matching lines in Second.Fragment',
    )
    await userEvent.click(expandButtons[0])
    expect(
      await screen.findByRole('button', { name: 'Collapse matching lines' }),
    ).toBeVisible()
    expect(fragmentService.find).toHaveBeenCalledWith(first.number)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
    expect(
      screen
        .getAllByRole('table')
        .map((table) => within(table).getAllByRole('row').length),
    ).toEqual([2, 1])
  })
})
