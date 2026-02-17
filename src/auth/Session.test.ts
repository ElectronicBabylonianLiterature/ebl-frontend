import Folio from 'fragmentarium/domain/Folio'
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
  ['create:proper_nouns', 'isAllowedToCreateProperNouns'],
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

describe.each([
  ['read:WGL-folios', 'WGL'],
  ['read:LV-folios', 'LV'],
  ['read:FWG-folios', 'FWG'],
  ['read:EL-folios', 'EL'],
  ['read:AKG-folios', 'AKG'],
  ['read:MJG-folios', 'MJG'],
  ['read:USK-folios', 'USK'],
  ['read:ILF-folios', 'ILF'],
  ['read:ARG-folios', 'ARG'],
  ['read:AS-folios', 'AS'],
  ['read:UG-folios', 'UG'],
  ['read:ER-folios', 'ER'],
  ['read:GS-folios', 'GS'],
  ['read:EVW-folios', 'EVW'],
  ['read:JLP-folios', 'JLP'],
  ['read:JVD-folios', 'JVD'],
])('%s %s', (scope, name) => {
  const folio = new Folio({ name: name, number: '1' })

  test('Returns true if session has scope', () => {
    const session = new MemorySession([scope])
    expect(session.isAllowedToReadFolio(folio)).toBe(true)
  })

  test('Returns false if folio is restricted and session does not have scope', () => {
    const session = new MemorySession([])
    expect(session.isAllowedToReadFolio(folio)).toBe(folio.isOpen)
  })
})
