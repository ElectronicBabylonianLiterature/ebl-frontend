import isAllowedMarkupUrl from 'transliteration/ui/isAllowedMarkupUrl'

test.each([
  'https://example.org/path',
  'http://example.org',
  '/library/BM.1',
  'relative/path',
  '../dictionary',
  '#note',
  '?page=2',
  'mailto:editor@example.org',
])('keeps safe existing links: %s', (url) => {
  expect(isAllowedMarkupUrl(url)).toBe(true)
})

test.each([
  '',
  ['java', 'script:alert(1)'].join(''),
  'data:text/html,test',
  '//example.org',
  '\\example.org',
  '/\\example.org',
  'java\tscript:alert(1)',
  'javascript\u007f:alert(1)',
  ' https://example.org',
  'not a url',
  'https://[invalid',
])('rejects unsafe links: %s', (url) => {
  expect(isAllowedMarkupUrl(url)).toBe(false)
})
