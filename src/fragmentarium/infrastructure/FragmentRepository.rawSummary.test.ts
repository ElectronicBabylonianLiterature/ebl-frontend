import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { cardSummaryLines } from 'test-support/fragment-query-summary'
import {
  apiClient,
  fragmentRepository,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

describe('FragmentRepository raw summary items', () => {
  it('maps the backend summary envelope into a render-ready query item', async () => {
    const rawReference = {
      id: 'RAW-REF-1',
      type: 'DISCUSSION',
      pages: '1-2',
      notes: 'raw summary reference',
      linesCited: ['1.'],
    }
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        {
          museumNumber: { prefix: 'X', number: '42', suffix: 'a' },
          accession: { prefix: 'A', number: '7', suffix: '' },
          description: 'Raw backend summary item',
          script: {
            period: 'LB',
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
              {
                number: 1,
                prefix: '1.',
                text: 'kur',
                tokens: [
                  {
                    type: 'Word',
                    value: 'kur',
                    cleanValue: 'kur',
                    uniqueLemma: ['raw'],
                  },
                ],
              },
              {
                number: 2,
                prefix: '2.',
                text: 'ša',
                tokens: [],
              },
            ],
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
    expect(item.fragment?.script.period.abbreviation).toEqual('LB')
    expect(item.fragment?.text.lines).toHaveLength(0)
    expect(cardSummaryLines(item)).toHaveLength(2)
    expect(item.fragment?.references).toHaveLength(1)
    expect(item.fragment?.references[0].id).toEqual('RAW-REF-1')
  })
})
