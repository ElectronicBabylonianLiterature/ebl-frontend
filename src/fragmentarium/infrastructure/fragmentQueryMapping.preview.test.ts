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
