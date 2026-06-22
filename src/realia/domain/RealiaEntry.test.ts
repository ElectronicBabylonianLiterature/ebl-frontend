import {
  getRealiaCrossReferences,
  groupAfoRegisterByVolume,
  formatAfoVolume,
} from 'realia/domain/RealiaEntry'
import {
  realiaEntryFactory,
  realiaCrossReferenceFactory,
  afoRegisterEntryFactory,
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

describe('formatAfoVolume', () => {
  it('keeps an existing "AfO" prefix', () => {
    expect(formatAfoVolume('AfO 25 (1974-1977)')).toBe('AfO 25 (1974-1977)')
  })

  it('adds the "AfO" prefix when absent', () => {
    expect(formatAfoVolume('25 (1974-1977)')).toBe('AfO 25 (1974-1977)')
  })
})

describe('groupAfoRegisterByVolume', () => {
  it('groups entries that share a volume and extracts the page', () => {
    const first = afoRegisterEntryFactory.build({
      mainWord: 'Tiamat',
      AfO: 'AfO 25 (1974-1977), 370',
    })
    const second = afoRegisterEntryFactory.build({
      mainWord: 'Apsû',
      AfO: 'AfO 25 (1974-1977), 372',
    })
    expect(groupAfoRegisterByVolume([first, second])).toEqual([
      {
        volume: 'AfO 25 (1974-1977)',
        entries: [
          { ...first, page: '370' },
          { ...second, page: '372' },
        ],
      },
    ])
  })

  it('keeps distinct volumes separate in first-seen order', () => {
    const volumes = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 26 (1978-1979), 12' }),
      afoRegisterEntryFactory.build({ AfO: 'AfO 25 (1974-1977), 370' }),
    ]).map((group) => group.volume)
    expect(volumes).toEqual(['AfO 26 (1978-1979)', 'AfO 25 (1974-1977)'])
  })

  it('normalizes a missing "AfO" prefix in the volume header', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: '99 (2000), 5' }),
    ])
    expect(group.volume).toBe('AfO 99 (2000)')
    expect(group.entries[0].page).toBe('5')
  })

  it('falls back to the last comma when there is no parenthesized year', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 25, 370' }),
    ])
    expect(group.volume).toBe('AfO 25')
    expect(group.entries[0].page).toBe('370')
  })

  it('falls back to the whole value with an empty page when there is no separator', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 25' }),
    ])
    expect(group.volume).toBe('AfO 25')
    expect(group.entries[0].page).toBe('')
  })
})
