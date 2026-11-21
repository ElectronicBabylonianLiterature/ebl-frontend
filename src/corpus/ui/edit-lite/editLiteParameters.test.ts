import {
  defaultEditLiteSourceMode,
  editLiteSourceModes,
  parseEditLiteParameters,
} from 'corpus/ui/edit-lite/editLiteParameters'

describe('parseEditLiteParameters', () => {
  test.each(['', '?', '?other=1'])('uses the defaults for "%s"', (search) => {
    expect(parseEditLiteParameters(search)).toEqual({
      source: 'auto',
      line: null,
    })
  })

  test('exposes the default source', () => {
    expect(defaultEditLiteSourceMode).toBe('auto')
  })

  test('reads all parameters', () => {
    expect(parseEditLiteParameters('?source=legacy&line=12a')).toEqual({
      source: 'legacy',
      line: '12a',
    })
  })

  test('reads parameters without the leading question mark', () => {
    expect(parseEditLiteParameters('source=api&line=3')).toEqual({
      source: 'api',
      line: '3',
    })
  })

  test.each([
    '?variant=accordion&size=25',
    '?variant=pages&size=50&debug=1',
    '?variant=score&variant=split&size',
  ])('ignores the parameters it does not know in "%s"', (search) => {
    expect(parseEditLiteParameters(`${search}&source=legacy&line=7`)).toEqual({
      source: 'legacy',
      line: '7',
    })
    expect(parseEditLiteParameters(search)).toEqual({
      source: 'auto',
      line: null,
    })
  })

  test.each([...editLiteSourceModes])('accepts the source %s', (source) => {
    expect(parseEditLiteParameters(`?source=${source}`).source).toBe(source)
  })

  test.each(['API', 'mongo', '', 'toString'])(
    'falls back to the default source for "%s"',
    (source) => {
      expect(parseEditLiteParameters(`?source=${source}`).source).toBe(
        defaultEditLiteSourceMode,
      )
    },
  )

  test('decodes and trims the line number', () => {
    expect(parseEditLiteParameters('?line=%2012%CA%BE%20').line).toBe('12ʾ')
    expect(parseEditLiteParameters("?line=a%2B1'").line).toBe("a+1'")
  })

  test.each(['?line=', '?line=%20', '?line'])(
    'has no line for "%s"',
    (search) => {
      expect(parseEditLiteParameters(search).line).toBeNull()
    },
  )

  test('uses the last value of a repeated parameter', () => {
    expect(
      parseEditLiteParameters('?source=api&source=legacy&line=1&line=2'),
    ).toEqual({ source: 'legacy', line: '2' })
  })

  test('ignores a repeated parameter that ends without a value', () => {
    expect(parseEditLiteParameters('?source=legacy&source').source).toBe(
      defaultEditLiteSourceMode,
    )
    expect(parseEditLiteParameters('?line=2&line').line).toBeNull()
  })
})
