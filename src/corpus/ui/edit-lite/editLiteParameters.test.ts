import { parse } from 'common/utils/queryString'
import {
  defaultEditLiteSourceMode,
  defaultEditLiteVariant,
  editLiteSourceModes,
  editLiteVariants,
  parseEditLiteParameters,
  withEditLiteVariant,
} from 'corpus/ui/edit-lite/editLiteParameters'
import { defaultPageSize, pageSizes } from 'corpus/ui/edit-lite/LinePager'

describe('parseEditLiteParameters', () => {
  test.each(['', '?', '?other=1'])('uses the defaults for "%s"', (search) => {
    expect(parseEditLiteParameters(search)).toEqual({
      variant: 'accordion',
      source: 'auto',
      size: 10,
      line: null,
    })
  })

  test('exposes the defaults', () => {
    expect(defaultEditLiteVariant).toBe('accordion')
    expect(defaultEditLiteSourceMode).toBe('auto')
  })

  test('reads all parameters', () => {
    expect(
      parseEditLiteParameters('?variant=pages&source=legacy&size=25&line=12a'),
    ).toEqual({ variant: 'pages', source: 'legacy', size: 25, line: '12a' })
  })

  test('reads parameters without the leading question mark', () => {
    expect(parseEditLiteParameters('variant=score&source=api')).toMatchObject({
      variant: 'score',
      source: 'api',
    })
  })

  test.each([...editLiteVariants])('accepts the variant %s', (variant) => {
    expect(parseEditLiteParameters(`?variant=${variant}`).variant).toBe(variant)
  })

  test.each(['Accordion', 'table', '', 'pages2', 'constructor'])(
    'falls back to the default variant for "%s"',
    (variant) => {
      expect(parseEditLiteParameters(`?variant=${variant}`).variant).toBe(
        defaultEditLiteVariant,
      )
    },
  )

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

  test.each([...pageSizes])('accepts the page size %s', (size) => {
    expect(parseEditLiteParameters(`?size=${size}`).size).toBe(size)
  })

  test.each(['7', '0', '-25', '25.5', '2e1', 'ten', '', '100'])(
    'falls back to the default page size for "%s"',
    (size) => {
      expect(parseEditLiteParameters(`?size=${size}`).size).toBe(
        defaultPageSize,
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
      parseEditLiteParameters(
        '?variant=pages&variant=split&source=api&source=legacy&size=50&size=25&line=1&line=2',
      ),
    ).toEqual({ variant: 'split', source: 'legacy', size: 25, line: '2' })
  })

  test('ignores a repeated parameter that ends without a value', () => {
    expect(parseEditLiteParameters('?variant=split&variant').variant).toBe(
      defaultEditLiteVariant,
    )
  })
})

describe('withEditLiteVariant', () => {
  test('adds the variant to an empty search', () => {
    expect(withEditLiteVariant('', 'split')).toBe('?variant=split')
  })

  test('replaces the variant only', () => {
    const search = withEditLiteVariant(
      '?source=legacy&variant=accordion&size=25&line=12a',
      'score',
    )

    expect(parse(search)).toEqual({
      source: 'legacy',
      variant: 'score',
      size: '25',
      line: '12a',
    })
  })

  test('replaces a repeated variant', () => {
    expect(withEditLiteVariant('?variant=pages&variant=split', 'score')).toBe(
      '?variant=score',
    )
  })

  test('keeps parameters it does not know and values it would not accept', () => {
    const search = withEditLiteVariant('?source=mongo&debug=1&line=', 'pages')

    expect(parse(search)).toEqual({
      source: 'mongo',
      debug: '1',
      line: '',
      variant: 'pages',
    })
  })

  test('keeps encoded values readable by the parser', () => {
    const search = withEditLiteVariant("?line=a%2B1'&size=50", 'pages')

    expect(parseEditLiteParameters(search)).toEqual({
      variant: 'pages',
      source: 'auto',
      size: 50,
      line: "a+1'",
    })
  })
})
