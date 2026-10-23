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
  'http:evil.com',
  '\u00a0javascript:alert(1)',
  '\u200bjavascript:alert(1)',
])('keeps safe existing links: %s', (url) => {
  expect(isAllowedMarkupUrl(url)).toBe(true)
})

test.each([
  '',
  ['java', 'script:alert(1)'].join(''),
  ['JAVA', 'SCRIPT:alert(1)'].join(''),
  'vbscript:alert(1)',
  'data:text/html,test',
  'ftp://example.org/file',
  'tel:+123456789',
  'doi:10.1000/example',
  'urn:isbn:1234567890',
  `blob:${window.location.origin}/file`,
  'https://user@evil.com',
  'https://www.ebl.lmu.de@evil.com/',
  'https://user:password@evil.com',
  '//example.org',
  '\\example.org',
  '/\\example.org',
  'java\tscript:alert(1)',
  'java\nscript:alert(1)',
  'javascript\u007f:alert(1)',
  ['/corpus/', String.fromCharCode(0), 'L/1/4'].join(''),
  ' https://example.org',
  'https://example.org ',
  ' ',
  'https://exa mple.org/path',
  'https://[invalid',
])('rejects unsafe links: %s', (url) => {
  expect(isAllowedMarkupUrl(url)).toBe(false)
})
