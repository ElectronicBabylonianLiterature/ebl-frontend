import {
  groupAfoRegisterByVolume,
  formatAfoRegisterVolumeTitle,
  AfoRegisterEntry,
} from 'realia/domain/RealiaEntry'
import { afoRegisterEntryFactory } from 'test-support/realia-fixtures'

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
        year: first.year,
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

  it('orders volumes by descending volume number regardless of input order', () => {
    const volumes = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 25', page: '370' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 52', page: '645' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 40/41', page: '420' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 48-49', page: '500' }),
    ]).map((group) => group.volume)
    expect(volumes).toEqual(['AfO 52', 'AfO 48-49', 'AfO 40/41', 'AfO 25'])
  })

  it('sorts a volume carrying no number last', () => {
    const volumes = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO Beiheft', page: '10' }),
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 25', page: '370' }),
    ]).map((group) => group.volume)
    expect(volumes).toEqual(['AfO 25', 'AfO Beiheft'])
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
  const cases: ReadonlyArray<{
    name: string
    entries: ReadonlyArray<Partial<AfoRegisterEntry>>
    entryId: string
    expected: { mainWord: string; details: string }
  }> = [
    {
      name: 'uses the main word as the title and pairs the volume with year and page',
      entries: [
        {
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          year: '1993/1994',
          page: '615',
        },
      ],
      entryId: 'Adad',
      expected: { mainWord: 'Adad', details: 'AfO 44/45 (1993/1994), 615' },
    },
    {
      name: 'drops a main word that just repeats the entry id with extra qualifiers',
      entries: [
        { mainWord: 'Enlil', afoVolume: 'AfO 25', year: '1977', page: '370' },
      ],
      entryId: 'Enlil, Ellil',
      expected: { mainWord: 'Enlil', details: 'AfO 25 (1977), 370' },
    },
    {
      name: 'shows a page range when entries span several pages',
      entries: [
        {
          mainWord: 'Akkad',
          afoVolume: 'AfO 44/45',
          year: '1993/1994',
          page: '615',
        },
        {
          mainWord: 'Akkad',
          afoVolume: 'AfO 44/45',
          year: '1993/1994',
          page: '617',
        },
      ],
      entryId: 'Akkad',
      expected: {
        mainWord: 'Akkad',
        details: 'AfO 44/45 (1993/1994), 615-617',
      },
    },
    {
      name: 'joins distinct main words within a volume',
      entries: [
        { mainWord: 'adû', afoVolume: 'AfO 50', year: '2003', page: '545' },
        { mainWord: 'Ad(d)u', afoVolume: 'AfO 50', year: '2003', page: '545' },
      ],
      entryId: 'adû',
      expected: { mainWord: 'adû, Ad(d)u', details: 'AfO 50 (2003), 545' },
    },
    {
      name: 'omits the page when no entry carries one',
      entries: [
        { mainWord: 'Adad', afoVolume: 'AfO 25', year: '1977', page: '' },
      ],
      entryId: 'Adad',
      expected: { mainWord: 'Adad', details: 'AfO 25 (1977)' },
    },
    {
      name: 'omits the year when no entry carries one',
      entries: [
        { mainWord: 'Adad', afoVolume: 'AfO 25', year: '', page: '370' },
      ],
      entryId: 'Adad',
      expected: { mainWord: 'Adad', details: 'AfO 25, 370' },
    },
    {
      name: 'falls back to the entry id when no main word is present',
      entries: [
        { mainWord: '', afoVolume: 'AfO 25', year: '1977', page: '370' },
      ],
      entryId: 'Enlil, Ellil',
      expected: { mainWord: 'Enlil, Ellil', details: 'AfO 25 (1977), 370' },
    },
  ]

  it.each(cases)('$name', ({ entries, entryId, expected }) => {
    const [group] = groupAfoRegisterByVolume(
      entries.map((overrides) => afoRegisterEntryFactory.build(overrides)),
    )
    expect(formatAfoRegisterVolumeTitle(entryId, group)).toEqual(expected)
  })
})
