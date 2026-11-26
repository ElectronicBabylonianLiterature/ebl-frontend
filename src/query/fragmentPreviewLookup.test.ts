import fragmentPreviewLookup from 'query/fragmentPreviewLookup'

describe('fragmentPreviewLookup', () => {
  it('skips duplicate indexes before applying the limit', () => {
    expect(fragmentPreviewLookup([5, 1, 5, 6], 3)).toEqual({
      lines: [5, 1, 6],
      excludeLines: false,
    })
  })

  it('excludes lines when nothing matched', () => {
    expect(fragmentPreviewLookup([], 3)).toEqual({
      lines: [],
      excludeLines: true,
    })
  })
})
