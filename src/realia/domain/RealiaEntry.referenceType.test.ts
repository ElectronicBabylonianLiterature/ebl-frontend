import {
  getRedirectTarget,
  getReferenceTypes,
  getReferenceTypeSectionSizes,
} from 'realia/domain/RealiaEntry'
import {
  afoRegisterEntryFactory,
  eblRealiaEntryFactory,
  realiaCrossReferenceFactory,
  realiaEntryFactory,
  reallexikonEntryFactory,
} from 'test-support/realia-fixtures'

describe('getReferenceTypes', () => {
  it('returns the reference types the data carries', () => {
    const entry = realiaEntryFactory.build({ referenceType: ['eBL'] })
    expect(getReferenceTypes(entry)).toEqual(['eBL'])
  })

  it('derives the reference types from non-empty sections when the data has none', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: afoRegisterEntryFactory.buildList(2),
      eblRealia: eblRealiaEntryFactory.buildList(1),
    })
    expect(getReferenceTypes(entry)).toEqual(['AfO', 'eBL'])
  })

  it('returns no reference types for an entry without sections', () => {
    const entry = realiaEntryFactory.build({ reallexikon: [], afoRegister: [] })
    expect(getReferenceTypes(entry)).toEqual([])
  })
})

describe('getReferenceTypeSectionSizes', () => {
  it('counts the entries of each section', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: reallexikonEntryFactory.buildList(3),
      afoRegister: afoRegisterEntryFactory.buildList(2),
      eblRealia: eblRealiaEntryFactory.buildList(1),
    })
    expect(getReferenceTypeSectionSizes(entry)).toEqual({
      RlA: 3,
      AfO: 2,
      eBL: 1,
    })
  })
})

describe('getRedirectTarget with eBL Realia', () => {
  it('does not redirect an entry whose own content is an eBL entry', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [],
      eblRealia: eblRealiaEntryFactory.buildList(1),
      crossReferences: [realiaCrossReferenceFactory.build()],
    })
    expect(getRedirectTarget(entry)).toBeNull()
  })
})
