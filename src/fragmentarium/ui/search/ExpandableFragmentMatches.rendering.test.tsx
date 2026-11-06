/* eslint-disable camelcase */
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { SurfaceAtLine, ColumnAtLine } from 'transliteration/domain/at-lines'
import { NoteLine } from 'transliteration/domain/note-line'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  previewLine,
  readingWord,
  tokenWithClass,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import {
  createFragmentCardSummary,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'
import {
  fragmentService,
  renderFragmentLines,
  resetFragmentLineMocks,
} from 'fragmentarium/ui/search/ExpandableFragmentMatches.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(resetFragmentLineMocks)

describe('expanding Library matching lines: rendering', () => {
  function fullFragmentWithMarkers(base: Fragment): Fragment {
    return Fragment.create({
      ...base,
      text: new Text({
        lines: [
          new SurfaceAtLine({
            type: 'SurfaceAtLine',
            prefix: '@',
            content: [],
            displayValue: 'obverse',
            surface_label: {
              surface: 'OBVERSE',
              text: 'obverse',
              abbreviation: 'o',
              status: [],
            },
          }),
          new TextLine(previewLine(6, [readingWord])),
          new NoteLine({ content: [], parts: [] }),
          new SurfaceAtLine({
            type: 'SurfaceAtLine',
            prefix: '@',
            content: [],
            displayValue: 'reverse',
            surface_label: {
              surface: 'REVERSE',
              text: 'reverse',
              abbreviation: 'r',
              status: [],
            },
          }),
          new ColumnAtLine({
            type: 'ColumnAtLine',
            prefix: '@',
            content: [],
            displayValue: 'column ii',
            column_label: { column: 2, abbreviation: 'ii', status: [] },
          }),
          new TextLine(previewLine(6, [readingWord])),
          new TextLine(previewLine(7, [readingWord])),
        ],
      }),
    })
  }

  it('loads one card on demand, uses source order and labels, and reuses loaded data', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const fullFragment = fullFragmentWithMarkers(base)
    const reverse = {
      ...previewLine(6, [readingWord]),
      index: 5,
      location: {
        object: null,
        surface: 'r',
        column: 'ii',
        sealNumber: null,
      },
    }
    const obverse = {
      ...previewLine(6, [readingWord]),
      index: 1,
      location: {
        object: null,
        surface: 'o',
        column: null,
        sealNumber: null,
      },
    }
    fragmentService.find.mockResolvedValueOnce(fullFragment)
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [5, 1, 5, 6],
        matchCount: 2,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, [reverse, obverse]),
        cardSummary: createFragmentCardSummary(),
      },
      2,
      [SUMMARY_LEMMA_ID],
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(fragmentService.find).toHaveBeenCalledWith(base.number)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('link', { name: 'r. ii 7' })).toBeVisible()
    expect(
      within(screen.getByRole('table'))
        .getAllByRole('cell')
        .filter((cell) =>
          cell.classList.contains('fragment-lines-with-lemma__line-number'),
        )
        .map((cell) => cell.textContent),
    ).toEqual(['o. 6', 'r. ii 6', 'r. ii 7'])
    expect(
      screen.getAllByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toHaveLength(3)

    await userEvent.click(
      screen.getByRole('button', { name: 'Collapse matching lines' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })

  it('keeps already ordered source indexes in order', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    fragmentService.find.mockResolvedValueOnce(fullFragmentWithMarkers(base))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: [1, 5, 5, 6],
        matchCount: 2,
        totalMatchingLines: 3,
        fragment: withPreviewLines(base, [
          { ...previewLine(6, [readingWord]), index: 1 },
          { ...previewLine(6, [readingWord]), index: 5 },
        ]),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more matching line' }),
    )
    expect(await screen.findByRole('link', { name: 'r. ii 7' })).toBeVisible()
    expect(
      within(screen.getByRole('table'))
        .getAllByRole('cell')
        .filter((cell) =>
          cell.classList.contains('fragment-lines-with-lemma__line-number'),
        )
        .map((cell) => cell.textContent),
    ).toEqual(['o. 6', 'r. ii 6', 'r. ii 7'])
  })

  it('reveals large result sets in bounded batches', async () => {
    const base = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
    const lines = Array.from({ length: 25 }, (_unused, index) =>
      previewLine(index + 1, []),
    )
    fragmentService.find.mockResolvedValueOnce(withPreviewLines(base, lines))
    renderFragmentLines(
      {
        museumNumber: base.number,
        matchingLines: lines.map((_line, index) => index),
        matchCount: 25,
        totalMatchingLines: 25,
        fragment: withPreviewLines(base, lines.slice(0, 2)),
        cardSummary: createFragmentCardSummary(),
      },
      2,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 10 more matching lines' }),
    )
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(12))
    expect(
      screen.getByRole('button', { name: 'Show 10 more matching lines' }),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 10 more matching lines' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(22)
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 3 more matching lines' }),
    )
    expect(screen.getAllByRole('row')).toHaveLength(25)
    expect(
      screen.queryByRole('button', { name: /more matching lines/ }),
    ).not.toBeInTheDocument()
    expect(fragmentService.find).toHaveBeenCalledTimes(1)
  })
})
