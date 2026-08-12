import { fragment, fragmentDto } from 'test-support/test-fragment'
import { compactMatchingLinePreview } from 'test-support/fragment-query-summary'
import {
  createSummaryItemDto,
  fragmentRepository,
  mockQueryItems,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

describe('FragmentRepository summary contract drift', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    {
      drift: 'a renamed description',
      applyDrift: (itemDto: Record<string, unknown>): void => {
        itemDto.summaryDescription = itemDto.description
        delete itemDto.description
      },
    },
    {
      drift: 'a dropped script',
      applyDrift: (itemDto: Record<string, unknown>): void => {
        delete itemDto.script
      },
    },
    {
      drift: 'a dropped hasPhoto',
      applyDrift: (itemDto: Record<string, unknown>): void => {
        delete itemDto.hasPhoto
      },
    },
    {
      drift: 'a null script',
      applyDrift: (itemDto: Record<string, unknown>): void => {
        itemDto.script = null
      },
    },
    {
      drift: 'a retyped hasPhoto',
      applyDrift: (itemDto: Record<string, unknown>): void => {
        itemDto.hasPhoto = 'true'
      },
    },
  ])(
    'reports $drift as an unsupported summary instead of a legacy item',
    async ({ applyDrift }) => {
      const itemDto = createSummaryItemDto({})
      applyDrift(itemDto)
      mockQueryItems([itemDto])

      const result = await fragmentRepository.query({ lemmas: 'kur' })
      const item = result.items[0]

      expect(item.cardSummary).toEqual({
        type: 'UnsupportedFragmentCardSummary',
      })
      expect(item.museumNumber).toEqual(fragment.number)
      expect(item.fragment).toBeUndefined()
    },
  )

  it('reports drift even when only a summary-only field survives', async () => {
    mockQueryItems([
      {
        museumNumber: fragmentDto.museumNumber,
        matchingLines: [1],
        matchCount: 1,
        matchingLinePreview: compactMatchingLinePreview,
      },
    ])

    const result = await fragmentRepository.query({ lemmas: 'kur' })

    expect(result.items[0].cardSummary).toEqual({
      type: 'UnsupportedFragmentCardSummary',
    })
  })

  it('maps summary metadata without matchingLinePreview using an empty preview', async () => {
    const itemDto = createSummaryItemDto({
      matchingLines: [],
      matchCount: 0,
    })
    delete itemDto.matchingLinePreview
    delete itemDto.thumbnailPath
    mockQueryItems([itemDto])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.thumbnailPath).toBeNull()
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.text.lines).toHaveLength(0)
    expect(item.cardSummary).toEqual({
      type: 'FragmentCardSummary',
      matchingLinePreview: [],
    })
  })

  it('maps summary metadata with null matchingLinePreview using an empty preview', async () => {
    mockQueryItems([
      createSummaryItemDto({
        matchingLines: [],
        matchingLinePreview: null,
        matchCount: 0,
      }),
    ])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.text.lines).toHaveLength(0)
    expect(item.cardSummary).toEqual({
      type: 'FragmentCardSummary',
      matchingLinePreview: [],
    })
  })
})
