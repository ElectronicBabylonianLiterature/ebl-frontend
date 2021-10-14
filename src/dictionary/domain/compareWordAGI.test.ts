import compareAfO from './compareWordAGI'

test.each([
  ['AfO 50 (2003/2004) 608', 'AfO 42/43 (1995/1996) 457', -1],
  ['AfO 42/43 (1995/1996) 457', 'AfO 33 (1986) 357', -1],
  ['AfO 50 (2003/2004) 608', 'AfO 33 (1986) 357', -1],
  ['AfO 50 (2003/2004) 608', 'AfO Beiheft 21 (1986) 25', -1],
  ['AfO 33 (1986) 357', 'AfO Beiheft 21 (1986) 25', -1],
  ['AfO 42/43 (1995/1996) 457', 'AfO Beiheft 21 (1986) 25', -1],
  ['AfO 42/43 (1995/1996) 457', 'AfO 42/43 (1995/1996) 457', 0],
  ['AfO 50 (2003/2004) 608', 'AfO 50 (2003/2004) 608', 0],
  ['', '', 0],
  ['AfO 33 (1986) 357', 'AfO 33 (1986) 357', 0],
  ['AfO 42/43 (1995/1996) 457', 'AfO 50 (2003/2004) 608', 1],
  ['AfO 33 (1986) 357', 'AfO 42/43 (1995/1996) 457', 1],
  ['AfO 33 (1986) 357', 'AfO 50 (2003/2004) 608', 1],
])('compares %s and %s', (a: string, b: string, expected: number) => {
  const comparedAGIs = compareAfO({ AfO: a }, { AfO: b })
  expect(comparedAGIs).toBe(expected)
  const comparedAGIsReversed = compareAfO({ AfO: b }, { AfO: a })
  if (expected !== 0) {
    expect(comparedAGIsReversed).toBe(-expected)
  }
})
