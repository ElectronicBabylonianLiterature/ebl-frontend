import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { createSummaryItemDto } from 'fragmentarium/infrastructure/fragmentRepository.testSupport'
import { fragmentDto } from 'test-support/test-fragment-dto'
import { QueryItem } from 'query/QueryResult'

const unsupported = { type: 'UnsupportedFragmentCardSummary' }
const supported = { type: 'FragmentCardSummary' }

function mapItems(
  items: readonly Record<string, unknown>[],
): readonly QueryItem[] {
  return createQueryResult({
    items: items as never,
    matchCountTotal: items.length,
  }).items
}

function withoutField(field: string): Record<string, unknown> {
  const itemDto = createSummaryItemDto({})
  delete itemDto[field]
  return itemDto
}

describe('malformed summary identity fields', () => {
  it.each([
    ['museumNumber missing', withoutField('museumNumber')],
    ['museumNumber null', createSummaryItemDto({ museumNumber: null })],
    [
      'museumNumber not an object',
      createSummaryItemDto({ museumNumber: 'Test.Fragment' }),
    ],
    [
      'museumNumber malformed object',
      createSummaryItemDto({ museumNumber: { prefix: 'Test' } }),
    ],
    [
      'museumNumber missing the number field',
      createSummaryItemDto({ museumNumber: { prefix: 'Test', suffix: '' } }),
    ],
    [
      'museumNumber with a non-string number',
      createSummaryItemDto({
        museumNumber: { prefix: 'Test', number: 7, suffix: '' },
      }),
    ],
    ['matchingLines missing', withoutField('matchingLines')],
    [
      'matchingLines not an array',
      createSummaryItemDto({ matchingLines: '1,2' }),
    ],
    [
      'matchingLines with non-numeric members',
      createSummaryItemDto({ matchingLines: ['1', 2] }),
    ],
    [
      'matchingLines with a negative member',
      createSummaryItemDto({ matchingLines: [-1] }),
    ],
    ['matchCount missing', withoutField('matchCount')],
    ['matchCount negative', createSummaryItemDto({ matchCount: -1 })],
    ['matchCount not a number', createSummaryItemDto({ matchCount: '2' })],
    ['matchCount fractional', createSummaryItemDto({ matchCount: 1.5 })],
  ])('degrades locally for %s', (unusedName, itemDto) => {
    const [item] = mapItems([itemDto])

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it.each([
    ['museumNumber', withoutField('museumNumber'), ''],
    [
      'museumNumber',
      createSummaryItemDto({ museumNumber: { prefix: 'Test' } }),
      '',
    ],
  ])('never fabricates a %s', (unusedName, itemDto, expected) => {
    expect(mapItems([itemDto])[0].museumNumber).toEqual(expected)
  })

  it('falls back to safe identity values rather than propagating garbage', () => {
    const [item] = mapItems([
      createSummaryItemDto({ matchingLines: '1,2', matchCount: -3 }),
    ])

    expect(item.matchingLines).toEqual([])
    expect(item.matchCount).toEqual(0)
  })

  it('classifies a legacy item without a museum number as unsupported', () => {
    const [item] = mapItems([{ matchingLines: [1], matchCount: 1 }])

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })
})

describe('malformed items never reject the query result', () => {
  const validFirst = createSummaryItemDto({
    museumNumber: { prefix: 'Valid', number: '1', suffix: '' },
  })
  const validLast = createSummaryItemDto({
    museumNumber: { prefix: 'Valid', number: '3', suffix: '' },
  })
  const malformedMiddle = createSummaryItemDto({ museumNumber: null })

  it('keeps valid siblings on either side of a malformed item', () => {
    const items = mapItems([validFirst, malformedMiddle, validLast])

    expect(items).toHaveLength(3)
    expect(items[0].cardSummary).toEqual(supported)
    expect(items[0].fragment?.number).toEqual('Valid.1')
    expect(items[1].cardSummary).toEqual(unsupported)
    expect(items[2].cardSummary).toEqual(supported)
    expect(items[2].fragment?.number).toEqual('Valid.3')
  })

  it('resolves the mapping promise instead of rejecting the whole page', async () => {
    await expect(
      Promise.resolve({
        items: [validFirst, malformedMiddle, validLast] as never,
        matchCountTotal: 3,
      }).then(createQueryResult),
    ).resolves.toMatchObject({ matchCountTotal: 3 })
  })

  it('does not throw for a page made entirely of malformed items', () => {
    expect(() =>
      mapItems([malformedMiddle, withoutField('matchCount')]),
    ).not.toThrow()
  })

  it.each([
    ['an unknown project abbreviation', { projects: ['NEWPROJECT'] }],
    ['a malformed date', { date: 'not-a-date' }],
    ['references that are not an array', { references: {} }],
  ])(
    'degrades a summary item with %s to a single unavailable card',
    (unusedName, overrides) => {
      const items = mapItems([
        validFirst,
        createSummaryItemDto(overrides),
        validLast,
      ])

      expect(items).toHaveLength(3)
      expect(items[0].cardSummary).toEqual(supported)
      expect(items[0].fragment?.number).toEqual('Valid.1')
      expect(items[1].cardSummary).toEqual(unsupported)
      expect(items[1].fragment).toBeUndefined()
      expect(items[2].cardSummary).toEqual(supported)
      expect(items[2].fragment?.number).toEqual('Valid.3')
    },
  )

  it('keeps the museum number on a card degraded by a non-identity field', () => {
    const [item] = mapItems([createSummaryItemDto({ date: 'not-a-date' })])

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.museumNumber).toBeTruthy()
  })

  it('degrades a malformed prefetched fragment dto to a single unavailable card', () => {
    const malformedFragmentDto: Record<string, unknown> = { ...fragmentDto }
    delete malformedFragmentDto.length

    const [item] = mapItems([
      {
        museumNumber: { prefix: 'Test', number: '1', suffix: '' },
        matchingLines: [],
        matchCount: 0,
        fragment: malformedFragmentDto,
      },
    ])

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
    expect(item.museumNumber).toEqual('Test.1')
  })
})
