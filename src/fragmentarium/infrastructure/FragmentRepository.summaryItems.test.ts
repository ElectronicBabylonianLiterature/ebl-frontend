import { fragment, fragmentDto } from 'test-support/test-fragment'
import { FragmentQuery } from 'query/FragmentQuery'
import { textLineDto } from 'test-support/lines/text-line'
import {
  createFragmentRepositoryTestContext,
  createSummaryItemDto,
  emptyMatchingLinePreview,
  mockQueryItems,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

describe('FragmentRepository query summary items', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('preserves nullable count and pagination metadata', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      items: [],
      matchCountTotal: null,
      isMatchCountTotalExact: false,
      hasNextPage: true,
    })

    await expect(
      fragmentRepository.query({ transliteration: 'šim' }),
    ).resolves.toMatchObject({
      items: [],
      matchCountTotal: null,
      isMatchCountTotalExact: false,
      hasNextPage: true,
    })
  })

  it.each(['parser_version', 'parserVersion'] as const)(
    'accepts matchingLinePreview.%s',
    async (parserVersionField) => {
      mockQueryItems(apiClient, [
        createSummaryItemDto({
          matchingLinePreview: {
            lines: [textLineDto],
            numberOfLines: 1,
            [parserVersionField]: 'backend',
          },
        }),
      ])

      const result = await fragmentRepository.query({ lemmas: 'kur' })

      expect(result.items[0].fragment?.text.lines).toHaveLength(1)
    },
  )

  it('maps summary items into prefetched fragments and thumbnail paths', async () => {
    const thumbnailPath = '/images/Test.Fragment.jpg'
    mockQueryItems(apiClient, [createSummaryItemDto({ thumbnailPath })])

    const result = await fragmentRepository.query({ transliteration: 'šim' })
    const item = result.items[0]

    expect(item.museumNumber).toEqual(fragment.number)
    expect(item.thumbnailPath).toEqual(thumbnailPath)
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.accession).toEqual(fragment.accession)
    expect(item.fragment?.description).toEqual(fragment.description)
    expect(item.fragment?.hasPhoto).toBe(true)
    expect(item.fragment?.archaeology?.excavationNumber).toEqual(
      fragment.number,
    )
    expect(item.fragment?.archaeology?.site?.name).toEqual('Sippar')
    expect(item.fragment?.text.lines).toHaveLength(fragment.text.lines.length)
  })

  it('maps summary items with empty matching lines and an empty preview', async () => {
    mockQueryItems(apiClient, [
      createSummaryItemDto({
        matchingLines: [],
        matchingLinePreview: emptyMatchingLinePreview,
        matchCount: 0,
      }),
    ])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.matchingLines).toEqual([])
    expect(item.matchCount).toEqual(0)
    expect(item.thumbnailPath).toBeNull()
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.text.lines).toHaveLength(0)
  })

  it('keeps old-shape items without summary metadata on the hydration path', async () => {
    mockQueryItems(apiClient, [
      {
        museumNumber: fragmentDto.museumNumber,
        matchingLines: [],
        matchCount: 0,
      },
    ])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.thumbnailPath).toBeUndefined()
    expect(item.fragment).toBeUndefined()
  })

  it('maps summary metadata without matchingLinePreview using an empty preview', async () => {
    const itemDto = createSummaryItemDto({
      matchingLines: [],
      matchCount: 0,
    })
    delete itemDto.matchingLinePreview
    delete itemDto.thumbnailPath
    mockQueryItems(apiClient, [itemDto])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.thumbnailPath).toBeNull()
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.text.lines).toHaveLength(0)
  })

  it('maps summary metadata with null matchingLinePreview using an empty preview', async () => {
    mockQueryItems(apiClient, [
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
  })

  it('maps summary items when optional fields are omitted', async () => {
    mockQueryItems(apiClient, [
      createSummaryItemDto({
        accession: null,
        date: null,
        genres: [],
        archaeology: null,
        references: [],
        projects: [],
        dossiers: [],
        matchingLines: [],
        matchCount: 0,
        hasPhoto: false,
        thumbnailPath: null,
      }),
    ])

    const result = await fragmentRepository.query({ number: fragment.number })
    const item = result.items[0]

    expect(item.thumbnailPath).toBeNull()
    expect(item.fragment?.accession).toEqual('')
    expect(item.fragment?.date).toBeUndefined()
    expect(item.fragment?.archaeology).toBeUndefined()
    expect(item.fragment?.projects).toEqual([])
    expect(item.fragment?.dossiers).toEqual([])
  })

  it.each<FragmentQuery>([
    { number: fragment.number },
    { project: 'CAIC' },
    { site: 'Sippar' },
    { genre: 'ARCHIVE' },
  ])(
    'maps summary-capable filter rows without matchingLinePreview for %#',
    async (query) => {
      const itemDto = createSummaryItemDto({
        matchingLines: [],
        matchCount: 0,
      })
      delete itemDto.matchingLinePreview
      mockQueryItems(apiClient, [itemDto])

      const result = await fragmentRepository.query(query)
      const item = result.items[0]

      expect(item.fragment?.number).toEqual(fragment.number)
      expect(item.fragment?.text.lines).toHaveLength(0)
    },
  )
})
