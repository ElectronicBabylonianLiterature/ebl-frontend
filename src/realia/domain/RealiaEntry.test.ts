import {
  afoCrossReferenceCitation,
  getRealiaCrossReferences,
  getRedirectTarget,
  realiaCrossReferenceTarget,
  rlaArticleUrl,
} from 'realia/domain/RealiaEntry'
import {
  realiaEntryFactory,
  realiaCrossReferenceFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'

describe('rlaArticleUrl', () => {
  it.each([
    ['1069', 'https://publikationen.badw.de/de/rla/index#1069'],
    ['1071', 'https://publikationen.badw.de/de/rla/index#1071'],
    ['6402', 'https://publikationen.badw.de/de/rla/index#6402'],
    ['12583', 'https://publikationen.badw.de/de/rla/index#12583'],
  ])('builds the online RlA URL for id %s', (id, expected) => {
    expect(rlaArticleUrl(id)).toBe(expected)
  })

  it('encodes characters that are unsafe in a URL fragment', () => {
    expect(rlaArticleUrl('a b')).toBe(
      'https://publikationen.badw.de/de/rla/index#a%20b',
    )
  })
})

describe('realiaCrossReferenceTarget', () => {
  it('navigates by the lemma, which is the route-resolvable key', () => {
    expect(
      realiaCrossReferenceTarget({
        id: 'realia_elam',
        lemma: 'Elam (Geschichte)',
      }),
    ).toBe('Elam (Geschichte)')
  })

  it('falls back to the realiaId only when the lemma is missing', () => {
    expect(realiaCrossReferenceTarget({ id: 'realia_elam', lemma: '' })).toBe(
      'realia_elam',
    )
  })
})

describe('afoCrossReferenceCitation', () => {
  it('combines the AfO volume and page', () => {
    expect(
      afoCrossReferenceCitation(
        afoRegisterEntryFactory.build({ afoVolume: 'AfO 48/49', page: '358' }),
      ),
    ).toBe('(AfO 48/49, 358)')
  })

  it('drops the page when it is empty', () => {
    expect(
      afoCrossReferenceCitation(
        afoRegisterEntryFactory.build({ afoVolume: 'AfO 48/49', page: '' }),
      ),
    ).toBe('(AfO 48/49)')
  })

  it('returns an empty string when neither volume nor page is present', () => {
    expect(
      afoCrossReferenceCitation(
        afoRegisterEntryFactory.build({ afoVolume: '', page: '' }),
      ),
    ).toBe('')
  })
})

describe('getRealiaCrossReferences', () => {
  it('returns an empty list when there are no cross-references', () => {
    const entry = realiaEntryFactory.build({
      crossReferences: [],
      afoCrossReferences: [],
    })
    expect(getRealiaCrossReferences(entry)).toEqual([])
  })

  it('merges Reallexikon and AfO cross-references', () => {
    const rlaCrossReference = realiaCrossReferenceFactory.build({
      id: 'realia_1',
      lemma: 'Anu',
    })
    const afoCrossReference = realiaCrossReferenceFactory.build({
      id: 'realia_2',
      lemma: 'Enlil',
    })
    const entry = realiaEntryFactory.build({
      crossReferences: [rlaCrossReference],
      afoCrossReferences: [afoCrossReference],
    })
    expect(getRealiaCrossReferences(entry)).toEqual([
      rlaCrossReference,
      afoCrossReference,
    ])
  })

  it('de-duplicates cross-references that share an id', () => {
    const shared = realiaCrossReferenceFactory.build({
      id: 'realia_1',
      lemma: 'Anu',
    })
    const entry = realiaEntryFactory.build({
      crossReferences: [shared],
      afoCrossReferences: [{ ...shared }],
    })
    expect(getRealiaCrossReferences(entry)).toEqual([shared])
  })
})

describe('getRedirectTarget', () => {
  const target = realiaCrossReferenceFactory.build({
    id: 'realia_nusku',
    lemma: 'Nusku',
  })

  function redirectEntry(
    overrides = {},
  ): ReturnType<typeof realiaEntryFactory.build> {
    return realiaEntryFactory.build({
      id: 'Abaralaḫ',
      reallexikon: [],
      afoRegister: [],
      references: [],
      crossReferences: [target],
      afoCrossReferences: [],
      ...overrides,
    })
  }

  it('returns the single target for a redirect-shaped document', () => {
    expect(getRedirectTarget(redirectEntry())).toEqual(target)
  })

  it('tolerates a single stub Reallexikon link without a reference', () => {
    const entry = redirectEntry({
      reallexikon: [reallexikonEntryFactory.build({ reference: null })],
    })
    expect(getRedirectTarget(entry)).toEqual(target)
  })

  it('is not a redirect when the entry has AfO register content', () => {
    expect(
      getRedirectTarget(
        redirectEntry({ afoRegister: afoRegisterEntryFactory.buildList(1) }),
      ),
    ).toBeNull()
  })

  it('is not a redirect when the entry has references', () => {
    expect(
      getRedirectTarget(
        redirectEntry({ references: [referenceFactory.build()] }),
      ),
    ).toBeNull()
  })

  it('is not a redirect when a Reallexikon link carries a real reference', () => {
    const entry = redirectEntry({
      reallexikon: [
        reallexikonEntryFactory.build({ reference: referenceFactory.build() }),
      ],
    })
    expect(getRedirectTarget(entry)).toBeNull()
  })

  it('is not a redirect when there is not exactly one cross-reference pointer', () => {
    expect(getRedirectTarget(redirectEntry({ crossReferences: [] }))).toBeNull()
    expect(
      getRedirectTarget(
        redirectEntry({
          crossReferences: [
            target,
            realiaCrossReferenceFactory.build({ id: 'realia_other' }),
          ],
        }),
      ),
    ).toBeNull()
  })

  it('is not a redirect when an AfO cross-reference is present', () => {
    const entry = redirectEntry({
      afoCrossReferences: [realiaCrossReferenceFactory.build()],
    })
    expect(getRedirectTarget(entry)).toBeNull()
  })
})
