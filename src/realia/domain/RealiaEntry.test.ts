import { getRealiaCrossReferences } from 'realia/domain/RealiaEntry'
import {
  realiaEntryFactory,
  realiaCrossReferenceFactory,
} from 'test-support/realia-fixtures'

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
