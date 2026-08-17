import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { fragmentDto } from 'test-support/test-fragment'
import {
  previewLine,
  namedSign,
  word,
} from 'test-support/fragment-query-preview'
import { TextLineDto } from 'transliteration/domain/text-line'
import { QueryItem } from 'query/QueryResult'

function summaryItem(lines: readonly unknown[], matchCount: number): QueryItem {
  return createQueryResult({
    matchCountTotal: matchCount,
    items: [
      {
        museumNumber: fragmentDto.museumNumber,
        accession: null,
        description: 'summary',
        script: { ...fragmentDto.script, period: 'LB' },
        matchingLines: [1, 2, 3],
        matchingLinePreview: { lines: lines as readonly TextLineDto[] },
        matchCount,
        hasPhoto: false,
      },
    ],
  }).items[0]
}

const cappedPreview = Array.from({ length: 5 }, (_unused, index) =>
  previewLine(index + 1, [word('kur', [namedSign('Reading', 'kur')])]),
)

describe('preview line cap', () => {
  it('keeps the authoritative match count independent of the capped preview', () => {
    const item = summaryItem(cappedPreview, 12)

    expect(item.matchCount).toEqual(12)
    expect(item.fragment?.text.lines).toHaveLength(5)
  })

  it('maps an empty preview without failing the summary contract', () => {
    const item = summaryItem([], 0)

    expect(item.cardSummary).toEqual({ type: 'FragmentCardSummary' })
    expect(item.fragment?.text.lines).toHaveLength(0)
  })

  it('classifies unstructured legacy preview lines as unsupported', () => {
    const item = summaryItem(
      [{ number: 1, prefix: '1.', text: 'kur', tokens: [] }],
      3,
    )

    expect(item.cardSummary).toEqual({ type: 'UnsupportedFragmentCardSummary' })
    expect(item.fragment).toBeUndefined()
  })

  it('classifies preview lines without token content as unsupported', () => {
    const item = summaryItem([{ type: 'TextLine', prefix: '1.' }], 3)

    expect(item.cardSummary).toEqual({ type: 'UnsupportedFragmentCardSummary' })
    expect(item.fragment).toBeUndefined()
  })
})

describe('malformed structured preview lines', () => {
  const validWord = word('kur', [namedSign('Reading', 'kur')])
  const unsupported = { type: 'UnsupportedFragmentCardSummary' }

  it('classifies a preview line without a line number as unsupported', () => {
    const item = summaryItem(
      [{ type: 'TextLine', prefix: '1.', content: [validWord] }],
      3,
    )

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it('classifies an invalid line number shape as unsupported', () => {
    const item = summaryItem(
      [
        {
          type: 'TextLine',
          prefix: '1.',
          lineNumber: { number: '1', hasPrime: false },
          content: [validWord],
        },
      ],
      3,
    )

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it('classifies an incomplete line number range as unsupported', () => {
    const item = summaryItem(
      [
        {
          type: 'TextLine',
          prefix: '1-2.',
          lineNumber: {
            type: 'LineNumberRange',
            start: { number: 1, hasPrime: false },
          },
          content: [validWord],
        },
      ],
      3,
    )

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it('classifies a token without enclosure information as unsupported', () => {
    const line = previewLine(1, [])
    const item = summaryItem(
      [{ ...line, content: [{ type: 'ValueToken', value: 'kur' }] }],
      3,
    )

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it('classifies a malformed nested token part as unsupported', () => {
    const line = previewLine(1, [])
    const item = summaryItem(
      [
        {
          ...line,
          content: [{ ...validWord, parts: [{ type: 'Reading' }] }],
        },
      ],
      3,
    )

    expect(item.cardSummary).toEqual(unsupported)
    expect(item.fragment).toBeUndefined()
  })

  it('accepts a valid line number range', () => {
    const line = previewLine(1, [validWord])
    const item = summaryItem(
      [
        {
          ...line,
          lineNumber: {
            type: 'LineNumberRange',
            start: { number: 1, hasPrime: false },
            end: { number: 2, hasPrime: false },
          },
        },
      ],
      3,
    )

    expect(item.cardSummary).toEqual({ type: 'FragmentCardSummary' })
    expect(item.fragment?.text.lines).toHaveLength(1)
  })
})
