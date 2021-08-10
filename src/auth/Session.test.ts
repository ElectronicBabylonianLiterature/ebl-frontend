import MemorySession from './Session'

describe.each([
  ['read:words', 'isAllowedToReadWords'],
  ['write:words', 'isAllowedToWriteWords'],
  ['read:fragments', 'isAllowedToReadFragments'],
  ['transliterate:fragments', 'isAllowedToTransliterateFragments'],
  ['annotate:fragments', 'isAllowedToAnnotateFragments'],
  ['lemmatize:fragments', 'isAllowedToLemmatizeFragments'],
  ['write:bibliography', 'isAllowedToWriteBibliography'],
  ['read:texts', 'isAllowedToReadTexts'],
  ['write:texts', 'isAllowedToWriteTexts'],
  ['read:bibliography', 'isAllowedToReadBibliography'],
  ['access:beta', 'hasBetaAccess'],
])('%s %s', (scope, method) => {
  test('Returns true if session has scope', () => {
    const session = new MemorySession([scope])
    expect(session[method]()).toBe(true)
  })

  test('Returns false if session does not have scope', () => {
    const session = new MemorySession([])
    expect(session[method]()).toBe(false)
  })
})
