import {
  getRealiaCrossReferences,
  getRedirectTarget,
  groupAfoRegisterByVolume,
  formatAfoRegisterVolumeTitle,
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

describe('groupAfoRegisterByVolume', () => {
  it('groups entries that share a volume and reads the page from the field', () => {
    const first = afoRegisterEntryFactory.build({
      mainWord: 'Tiamat',
      afoVolume: 'AfO 25',
      page: '370',
    })
    const second = afoRegisterEntryFactory.build({
      mainWord: 'Apsû',
      afoVolume: 'AfO 25',
      page: '372',
    })
    expect(groupAfoRegisterByVolume([first, second])).toEqual([
      {
        volume: 'AfO 25',
        mainWords: ['Tiamat', 'Apsû'],
        pageRange: '370-372',
        hasDistinctMainWords: true,
        hasDistinctPages: true,
        entries: [first, second],
      },
    ])
  })

  it('collapses a shared main word and page into a single value', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 44/45',
        page: '615',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 44/45',
        page: '615',
      }),
    ])
    expect(group.mainWords).toEqual(['Adad'])
    expect(group.pageRange).toBe('615')
    expect(group.hasDistinctMainWords).toBe(false)
    expect(group.hasDistinctPages).toBe(false)
  })

  it('builds a numeric page range from the lowest to the highest page', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 44/45', page: '617' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 44/45', page: '615' }),
    ])
    expect(group.pageRange).toBe('615-617')
    expect(group.hasDistinctPages).toBe(true)
  })

  it('ignores empty pages when deriving the range and the distinct flag', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 46/47', page: '514' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 46/47', page: '' }),
    ])
    expect(group.pageRange).toBe('514')
    expect(group.hasDistinctPages).toBe(false)
  })

  it('joins non-numeric pages into a range in document order', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 50', page: '12a' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 50', page: '12b' }),
    ])
    expect(group.pageRange).toBe('12a-12b')
  })

  it('keeps distinct volumes separate in first-seen order', () => {
    const volumes = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 26', page: '12' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 25', page: '370' }),
    ]).map((group) => group.volume)
    expect(volumes).toEqual(['AfO 26', 'AfO 25'])
  })

  it('uses the afoVolume label verbatim, including the slash form', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 40/41', page: '420' }),
    ])
    expect(group.volume).toBe('AfO 40/41')
    expect(group.entries[0].page).toBe('420')
  })
})

describe('formatAfoRegisterVolumeTitle', () => {
  it('uses the main word as the title and pairs the volume with the page', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 44/45',
        page: '615',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 44/45, 615',
    })
  })

  it('drops a main word that just repeats the entry id with extra qualifiers', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Enlil',
        afoVolume: 'AfO 25',
        page: '370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil',
      details: 'AfO 25, 370',
    })
  })

  it('shows a page range when entries span several pages', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        afoVolume: 'AfO 44/45',
        page: '615',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        afoVolume: 'AfO 44/45',
        page: '617',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Akkad', group)).toEqual({
      mainWord: 'Akkad',
      details: 'AfO 44/45, 615-617',
    })
  })

  it('joins distinct main words within a volume', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'adû',
        afoVolume: 'AfO 50',
        page: '545',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Ad(d)u',
        afoVolume: 'AfO 50',
        page: '545',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('adû', group)).toEqual({
      mainWord: 'adû, Ad(d)u',
      details: 'AfO 50, 545',
    })
  })

  it('omits the page when no entry carries one', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 25',
        page: '',
      }),
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
        afoVolume: 'AfO 25',
        page: '370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil, Ellil',
      details: 'AfO 25, 370',
    })
  })
})
