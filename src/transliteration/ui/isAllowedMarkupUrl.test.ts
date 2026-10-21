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
  'www.example.com/#špecial cḫars',
  'https://example.org/path with spaces',
  'https://example.org/?query=some words',
  '../path with spaces',
  '?query=some words',
  '#note with spaces',
  'mailto:editor@example.org?subject=Please review&body=Some text',
  'not a url',
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
  'https://example.org ',
  ' ',
  'https://exa mple.org/path',
  'https://[invalid',
])('rejects unsafe links: %s', (url) => {
  expect(isAllowedMarkupUrl(url)).toBe(false)
})
