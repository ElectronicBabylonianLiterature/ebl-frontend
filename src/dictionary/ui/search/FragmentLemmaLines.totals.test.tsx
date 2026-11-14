import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { screen } from '@testing-library/react'
import { QueryItem } from 'query/QueryResult'
import { createFragmentCardSummary } from 'test-support/fragment-query-summary'
import { previewLine } from 'test-support/fragment-query-preview'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import {
  previewSubsetFragment,
  renderFragmentLemmaLines,
} from 'dictionary/ui/search/FragmentLemmaLines.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

function showItem(
  queryItem: QueryItem,
  loadedFragment: Fragment = previewSubsetFragment,
): void {
  fragmentService.query.mockResolvedValue({
    items: [queryItem],
    matchCountTotal: null,
  })
  fragmentService.find.mockResolvedValue(loadedFragment)
  renderFragmentLemmaLines(fragmentService, wordService)
}

describe('remaining line totals on the dictionary page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('counts unique indexes for a hydrated example without a total', async () => {
    showItem({
      museumNumber: previewSubsetFragment.number,
      matchingLines: [0, 1, 1, 2, 3],
      matchCount: 9,
    })

    expect(await screen.findByText('And 2 more matching lines')).toBeVisible()
    expect(fragmentService.find).toHaveBeenCalledWith(
      previewSubsetFragment.number,
      [0, 1, 2],
    )
  })

  it('treats a hydrated example without indexes as an unknown total', async () => {
    const fragmentWithMoreLines = Fragment.create({
      ...previewSubsetFragment,
      text: new Text({
        lines: [1, 2, 3, 4].map(
          (number) => new TextLine(previewLine(number, [])),
        ),
      }),
    })

    showItem(
      {
        museumNumber: previewSubsetFragment.number,
        matchingLines: [],
        matchCount: 9,
      },
      fragmentWithMoreLines,
    )

    expect(
      await screen.findByText('More matching lines may be available'),
    ).toBeVisible()
  })

  it('prefers the matching-line total for a hydrated example', async () => {
    showItem({
      museumNumber: previewSubsetFragment.number,
      matchingLines: [0, 1, 2],
      matchCount: 9,
      totalMatchingLines: 6,
    })

    expect(await screen.findByText('And 4 more matching lines')).toBeVisible()
  })

  it.each([undefined, null])(
    'falls back to the match count for a summary with a %s total',
    async (totalMatchingLines) => {
      showItem({
        museumNumber: previewSubsetFragment.number,
        matchingLines: [0, 1],
        matchCount: 5,
        totalMatchingLines,
        fragment: previewSubsetFragment,
        cardSummary: createFragmentCardSummary(),
      })

      expect(await screen.findByText('And 3 more matching lines')).toBeVisible()
    },
  )
})
