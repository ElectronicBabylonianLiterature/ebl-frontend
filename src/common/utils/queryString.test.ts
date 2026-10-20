import { parse, parseUrl, stringify } from 'common/utils/queryString'

describe('queryString', () => {
  it('stringifies with options', () => {
    expect(stringify({ ids: ['a', 'b'] }, { arrayFormat: 'comma' })).toEqual(
      'ids=a,b',
    )
  })

  it('parses a query string', () => {
    expect(parse('?a=1&b=2')).toEqual({ a: '1', b: '2' })
  })

  it('parses a url', () => {
    expect(parseUrl('/path?a=1')).toEqual({ url: '/path', query: { a: '1' } })
  })
})
