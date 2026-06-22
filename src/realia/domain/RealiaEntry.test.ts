import {
  getRealiaCrossReferences,
  groupAfoRegisterByVolume,
  formatAfoVolume,
  formatAfoRegisterVolumeTitle,
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
        mainWords: ['Tiamat', 'Apsû'],
        pageRange: '370-372',
        hasDistinctMainWords: true,
        hasDistinctPages: true,
        entries: [
          { ...first, page: '370' },
          { ...second, page: '372' },
        ],
      },
    ])
  })

  it('collapses a shared main word and page into a single value', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        AfO: 'AfO 44-45 (1997-1998), 615',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        AfO: 'AfO 44-45 (1997-1998), 615',
      }),
    ])
    expect(group.mainWords).toEqual(['Adad'])
    expect(group.pageRange).toBe('615')
    expect(group.hasDistinctMainWords).toBe(false)
    expect(group.hasDistinctPages).toBe(false)
  })

  it('builds a numeric page range from the lowest to the highest page', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 44-45 (1997-1998), 617' }),
      afoRegisterEntryFactory.build({ AfO: 'AfO 44-45 (1997-1998), 615' }),
    ])
    expect(group.pageRange).toBe('615-617')
    expect(group.hasDistinctPages).toBe(true)
  })

  it('ignores empty pages when deriving the range and the distinct flag', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 46-47 (1999-2000), 514' }),
      afoRegisterEntryFactory.build({ AfO: 'AfO 46-47 (1999-2000)' }),
    ])
    expect(group.pageRange).toBe('514')
    expect(group.hasDistinctPages).toBe(false)
  })

  it('joins non-numeric pages into a range in document order', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ AfO: 'AfO 50 (2003-2004), 12a' }),
      afoRegisterEntryFactory.build({ AfO: 'AfO 50 (2003-2004), 12b' }),
    ])
    expect(group.pageRange).toBe('12a-12b')
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

describe('formatAfoRegisterVolumeTitle', () => {
  it('uses the main word as the title and pairs the volume with the page', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        AfO: 'AfO 44-45 (1997-1998), 615',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 44-45 (1997-1998), 615',
    })
  })

  it('drops a main word that just repeats the entry id with extra qualifiers', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Enlil',
        AfO: 'AfO 25 (1974-1977), 370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil',
      details: 'AfO 25 (1974-1977), 370',
    })
  })

  it('shows a page range when entries span several pages', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        AfO: 'AfO 44-45 (1997-1998), 615',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        AfO: 'AfO 44-45 (1997-1998), 617',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Akkad', group)).toEqual({
      mainWord: 'Akkad',
      details: 'AfO 44-45 (1997-1998), 615-617',
    })
  })

  it('uses the differing main word as the title', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Schwein',
        AfO: 'AfO 52 (2018), 645',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Pig', group)).toEqual({
      mainWord: 'Schwein',
      details: 'AfO 52 (2018), 645',
    })
  })

  it('joins distinct main words within a volume', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'adû',
        AfO: 'AfO 50 (2003-2004), 545',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Ad(d)u',
        AfO: 'AfO 50 (2003-2004), 545',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('adû', group)).toEqual({
      mainWord: 'adû, Ad(d)u',
      details: 'AfO 50 (2003-2004), 545',
    })
  })

  it('omits the page when no entry carries one', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ mainWord: 'Adad', AfO: 'AfO 25' }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 25',
    })
  })

  it('falls back to the entry id when no main word is present', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: '',
        AfO: 'AfO 25 (1974-1977), 370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil, Ellil',
      details: 'AfO 25 (1974-1977), 370',
    })
  })
})
