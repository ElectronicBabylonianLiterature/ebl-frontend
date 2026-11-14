import { matchingLineTotal } from 'query/matchingLineTotals'

const item = {
  museumNumber: 'BM.23658',
  matchCount: 7,
  matchingLines: [1, 2, 3, 4, 5, 6, 7],
}

test.each([
  [{ transliteration: 'ku' }, 7],
  [{ lemmas: 'ku I' }, 7],
  [{ lemmas: 'ku I', lemmaOperator: 'phrase' as const }, 7],
  [{ transliteration: 'ku\nana' }, undefined],
  [{ lemmas: 'ku I+ana I', lemmaOperator: 'phrase' as const }, undefined],
  [
    {
      transliteration: 'ku',
      lemmas: 'ku I+ana I',
      lemmaOperator: 'phrase' as const,
    },
    7,
  ],
  [{ number: 'BM.23658' }, undefined],
  [{ lemmaOperator: 'phrase' as const }, undefined],
])('keeps only reliable legacy line totals for %p', (query, expected) => {
  expect(matchingLineTotal(item, query)).toBe(expected)
})

test('the backend distinct-line total takes precedence over window counts', () => {
  expect(
    matchingLineTotal(
      { ...item, totalMatchingLines: 9 },
      { transliteration: 'ku\nana' },
    ),
  ).toBe(9)
  expect(
    matchingLineTotal(
      { ...item, totalMatchingLines: 0 },
      { transliteration: 'ku' },
    ),
  ).toBe(0)
})
