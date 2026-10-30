import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { screen } from '@testing-library/react'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import { QueryItem, QueryResult } from 'query/QueryResult'
import WordService from 'dictionary/application/WordService'
import { produce, castDraft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import { tokenWithClass } from 'test-support/fragment-query-preview'
import { comment } from 'test-support/lines/control'
import {
  fragmentWithLemma,
  previewSubsetFragment,
  previewSubsetText,
  renderFragmentLemmaLines,
  renderWithDictionary,
  word,
} from 'dictionary/ui/search/FragmentLemmaLines.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')

beforeEach(() => {
  jest.clearAllMocks()
})

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

describe('Show Library entries', () => {
  const setup = async (): Promise<HTMLElement> => {
    const queryItem: QueryItem = {
      museumNumber: 'Test.Fragment',
      matchingLines: [0],
      matchCount: 1,
    }
    const queryResult: QueryResult = { items: [queryItem], matchCountTotal: 1 }
    fragmentService.query.mockReturnValue(Promise.resolve(queryResult))
    fragmentService.find.mockReturnValue(Promise.resolve(fragmentWithLemma))

    const view = renderFragmentLemmaLines(fragmentService, wordService)

    expect(fragmentService.query).toBeCalledWith({
      lemmas: word._id,
      limit: 10,
      count: 'exact',
    })
    await screen.findByText(fragmentWithLemma.number)
    return view
  }

  it('shows the fragment number', async () => {
    await setup()
    expect(await screen.findByText(fragmentWithLemma.number)).toBeVisible()
  })

  it('shows the matching Library line', async () => {
    const view = await setup()
    await screen.findByText(fragmentWithLemma.number)
    await screen.findByText('kur')
    expect(screen.getByRole('table')).toHaveTextContent('kur')
    expect(screen.getByRole('button', { name: 'kur' })).toBeVisible()
    expect(screen.getByText('10')).toBeVisible()
    expect(
      screen.getByRole('link', { name: fragmentWithLemma.number }),
    ).toHaveAttribute('href', `/library/${fragmentWithLemma.number}`)
    expect(
      screen.getByRole('link', {
        name: /Show all 1 matches in Library search/,
      }),
    ).toHaveAttribute('href', `/library/search/?lemmas=${word._id}`)
    expect(screen.getByText(/1 matches/, { selector: 'p' })).toBeVisible()
    expect(screen.getAllByTitle('View in fragmentarium search')).toHaveLength(2)
    expect(view).toMatchSnapshot()
  })

  it('renders example-count copy when matchCountTotal is null', async () => {
    const queryItem: QueryItem = {
      museumNumber: 'Test.Fragment',
      matchingLines: [0],
      matchCount: 1,
    }
    fragmentService.query.mockReturnValue(
      Promise.resolve({ items: [queryItem], matchCountTotal: null }),
    )
    fragmentService.find.mockReturnValue(Promise.resolve(fragmentWithLemma))

    renderFragmentLemmaLines(fragmentService, wordService)

    expect(
      await screen.findByText('Showing 1 Library document example'),
    ).toBeVisible()
    expect(screen.queryByText('0 matches')).not.toBeInTheDocument()
  })

  it('renders compact summary examples without hydrating fragments', async () => {
    const queryItem: QueryItem = {
      museumNumber: previewSubsetFragment.number,
      matchingLines: [0, 1, 2, 3, 4],
      matchCount: 5,
      totalMatchingLines: 5,
      fragment: previewSubsetFragment,
      cardSummary: createFragmentCardSummary(),
    }
    fragmentService.query.mockReturnValue(
      Promise.resolve({ items: [queryItem], matchCountTotal: null }),
    )

    renderFragmentLemmaLines(fragmentService, wordService)

    expect(await screen.findByText(previewSubsetFragment.number)).toBeVisible()
    expect(
      screen.getByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('And 3 more matching lines')).toBeVisible()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('reports unsupported summaries without hydrating fragments', async () => {
    const queryItem: QueryItem = {
      museumNumber: previewSubsetFragment.number,
      matchingLines: [0, 1],
      matchCount: 5,
      cardSummary: { type: 'UnsupportedFragmentCardSummary' },
    }
    fragmentService.query.mockReturnValue(
      Promise.resolve({ items: [queryItem], matchCountTotal: null }),
    )

    renderFragmentLemmaLines(fragmentService, wordService)

    expect(
      await screen.findByText('Details for this result are unavailable.'),
    ).toBeVisible()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('defensively renders no more than ten examples', async () => {
    const items = Array.from(
      { length: 12 },
      (_, index): QueryItem => ({
        museumNumber: `Test.Fragment.${index}`,
        matchingLines: [0],
        matchCount: 1,
        fragment: previewSubsetFragment,
        cardSummary: createFragmentCardSummary(),
      }),
    )
    fragmentService.query.mockReturnValue(
      Promise.resolve({ items, matchCountTotal: null }),
    )

    renderFragmentLemmaLines(fragmentService, wordService)

    expect(await screen.findByText('Test.Fragment.0')).toBeVisible()
    expect(screen.getByText('Test.Fragment.9')).toBeVisible()
    expect(screen.queryByText('Test.Fragment.10')).not.toBeInTheDocument()
    expect(fragmentService.find).not.toHaveBeenCalled()
  })
})

describe('RenderFragmentLines', () => {
  it('renders the preview subset without hydrating the fragment', () => {
    renderWithDictionary(
      <RenderFragmentLines
        fragment={previewSubsetFragment}
        lemmaIds={[word._id]}
        linesToShow={3}
        totalMatchingLines={5}
      />,
      wordService,
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'kur' })).toBeVisible()
    expect(screen.getByText('And 3 more matching lines')).toBeVisible()
  })

  it('uses cautious wording when no matching-line total is given', () => {
    renderWithDictionary(
      <RenderFragmentLines
        fragment={previewSubsetFragment}
        lemmaIds={[word._id]}
        linesToShow={1}
      />,
      wordService,
    )

    expect(
      screen.getByText('More matching lines may be available'),
    ).toBeVisible()
  })

  it('does not show a remainder when the exact total is visible', () => {
    renderWithDictionary(
      <RenderFragmentLines
        fragment={previewSubsetFragment}
        linesToShow={2}
        totalMatchingLines={2}
      />,
      wordService,
    )

    expect(screen.queryByText(/more matching lines/)).not.toBeInTheDocument()
  })

  it('does not count a control line as matching text', () => {
    const fragmentWithControl = produce(previewSubsetFragment, (draft) => {
      draft.text = castDraft(
        new Text({
          lines: [
            previewSubsetText.lines[0],
            comment,
            previewSubsetText.lines[1],
          ],
        }),
      )
    })

    renderWithDictionary(
      <RenderFragmentLines
        fragment={fragmentWithControl}
        linesToShow={1}
        totalMatchingLines={2}
      />,
      wordService,
    )

    expect(screen.getByText('And 1 more matching line')).toBeVisible()
  })
})
