import { fragment } from 'test-support/test-fragment'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import { textLineDto } from 'test-support/lines/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { PeriodModifiers } from 'common/utils/period'
import {
  createFragmentRepositoryTestContext,
  createSummaryItemDto,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

describe('FragmentRepository raw summary items', () => {
  it('maps the backend summary envelope into a render-ready query item', async () => {
    const rawReference = referenceDtoFactory.build({
      id: 'RAW-REF-1',
      type: 'DISCUSSION',
      pages: '1-2',
      notes: 'raw summary reference',
      linesCited: ['1.'],
      document: {
        id: 'RAW-REF-1',
        title: 'Raw backend reference',
        type: 'article-journal',
        issued: { 'date-parts': [[2024]] },
        author: [{ family: 'Tester', given: 'T.' }],
      },
    })
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        {
          museumNumber: { prefix: 'X', number: '42', suffix: 'a' },
          accession: { prefix: 'A', number: '7', suffix: '' },
          description: 'Raw backend summary item',
          script: {
            period: 'Late Babylonian',
            periodModifier: 'None',
            uncertain: false,
          },
          date: {
            year: { value: '10' },
            month: { value: '5' },
            day: { value: '12' },
            isSeleucidEra: true,
          },
          genres: [
            { category: ['ARCHIVE', 'Administrative'], uncertain: false },
          ],
          archaeology: {
            excavationNumber: { prefix: 'BM', number: '123', suffix: '' },
            site: { name: 'Babylon' },
          },
          references: [rawReference],
          projects: ['CAIC', 'RECC'],
          dossiers: [{ dossierId: 'D001', isUncertain: false }],
          matchingLines: [1, 2, 3, 4],
          matchingLinePreview: {
            lines: [
              textLineDto,
              {
                ...textLineDto,
                prefix: '2.',
                lineNumber: lineNumberFactory.build({ number: 2 }),
              },
            ],
            numberOfLines: 2,
            // eslint-disable-next-line camelcase
            parser_version: 'backend',
          },
          matchCount: 4,
          hasPhoto: true,
          thumbnailPath: '/images/raw-summary.jpg',
        },
      ],
    })

    const result = await fragmentRepository.query({ lemmas: 'raw' })
    const item = result.items[0]

    expect(item.museumNumber).toEqual(
      museumNumberToString({ prefix: 'X', number: '42', suffix: 'a' }),
    )
    expect(item.thumbnailPath).toEqual('/images/raw-summary.jpg')
    expect(item.fragment?.hasPhoto).toBe(true)
    expect(item.fragment?.accession).toEqual(
      museumNumberToString({ prefix: 'A', number: '7', suffix: '' }),
    )
    expect(
      item.fragment?.projects.map((project) => project.abbreviation),
    ).toEqual(['CAIC', 'RECC'])
    expect(item.fragment?.dossiers).toEqual([
      { dossierId: 'D001', isUncertain: false },
    ])
    expect(item.fragment?.archaeology?.excavationNumber).toEqual('BM.123')
    expect(item.fragment?.archaeology?.site?.name).toEqual('Babylon')
    expect(item.fragment?.text.lines).toHaveLength(2)
    expect(item.fragment?.references).toHaveLength(1)
    expect(item.fragment?.references[0].id).toEqual('RAW-REF-1')
  })
})

describe('FragmentRepository query summary with unrecognized script', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('produces a render-safe fragment when period is unrecognized', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        createSummaryItemDto({
          script: {
            period: 'ED IIIb',
            periodModifier: 'None',
            uncertain: false,
          },
        } as Record<string, unknown>),
      ],
    })

    const result = await fragmentRepository.query({ transliteration: 'kur₂' })
    const item = result.items[0]

    expect(item.fragment?.script.period.abbreviation).toBeDefined()
    expect(item.fragment?.script.period.abbreviation).toBe('Unc')
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.script.periodModifier).toBe(PeriodModifiers.None)
  })

  it('produces a render-safe fragment when period is null', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        createSummaryItemDto({
          script: {
            period: null,
            periodModifier: 'None',
            uncertain: false,
          },
        } as Record<string, unknown>),
      ],
    })

    const result = await fragmentRepository.query({ transliteration: 'kur₂' })
    const item = result.items[0]

    expect(item.fragment?.script.period.abbreviation).toBeDefined()
    expect(item.fragment?.script.period.abbreviation).toBe('Unc')
  })
})
