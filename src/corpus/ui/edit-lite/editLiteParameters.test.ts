import { parseEditLiteParameters } from 'corpus/ui/edit-lite/editLiteParameters'

describe('parseEditLiteParameters', () => {
  test.each(['', '?', '?other=1'])('has no line for "%s"', (search) => {
    expect(parseEditLiteParameters(search)).toEqual({ line: null })
  })

  test('reads the line', () => {
    expect(parseEditLiteParameters('?line=12a')).toEqual({ line: '12a' })
  })

  test('reads parameters without the leading question mark', () => {
    expect(parseEditLiteParameters('line=3')).toEqual({ line: '3' })
  })

  test.each([
    '?variant=accordion&size=25',
    '?variant=pages&size=50&debug=1',
    '?variant=score&variant=split&size',
    '?source=legacy',
    '?source=api&source=auto',
  ])('ignores the parameters it does not know in "%s"', (search) => {
    expect(parseEditLiteParameters(`${search}&line=7`)).toEqual({ line: '7' })
    expect(parseEditLiteParameters(search)).toEqual({ line: null })
  })

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
    expect(parseEditLiteParameters('?line=1&line=2')).toEqual({ line: '2' })
  })

  test('ignores a repeated parameter that ends without a value', () => {
    expect(parseEditLiteParameters('?line=2&line').line).toBeNull()
  })
})
