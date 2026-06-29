import {
  groupAfoRegisterByVolume,
  formatAfoRegisterVolumeTitle,
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

  it('uses the afoVolume label verbatim, including the slash form', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({ afoVolume: 'AfO 40/41', page: '420' }),
    ])
    expect(group.volume).toBe('AfO 40/41')
    expect(group.entries[0].page).toBe('420')
  })
})

describe('formatAfoRegisterVolumeTitle', () => {
  it('uses the main word as the title and pairs the volume with year and page', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 44/45',
        year: '1993/1994',
        page: '615',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 44/45 (1993/1994), 615',
    })
  })

  it('drops a main word that just repeats the entry id with extra qualifiers', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Enlil',
        afoVolume: 'AfO 25',
        year: '1977',
        page: '370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil',
      details: 'AfO 25 (1977), 370',
    })
  })

  it('shows a page range when entries span several pages', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        afoVolume: 'AfO 44/45',
        year: '1993/1994',
        page: '615',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Akkad',
        afoVolume: 'AfO 44/45',
        year: '1993/1994',
        page: '617',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Akkad', group)).toEqual({
      mainWord: 'Akkad',
      details: 'AfO 44/45 (1993/1994), 615-617',
    })
  })

  it('joins distinct main words within a volume', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'adû',
        afoVolume: 'AfO 50',
        year: '2003',
        page: '545',
      }),
      afoRegisterEntryFactory.build({
        mainWord: 'Ad(d)u',
        afoVolume: 'AfO 50',
        year: '2003',
        page: '545',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('adû', group)).toEqual({
      mainWord: 'adû, Ad(d)u',
      details: 'AfO 50 (2003), 545',
    })
  })

  it('omits the page when no entry carries one', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 25',
        year: '1977',
        page: '',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 25 (1977)',
    })
  })

  it('omits the year when no entry carries one', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: 'Adad',
        afoVolume: 'AfO 25',
        year: '',
        page: '370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Adad', group)).toEqual({
      mainWord: 'Adad',
      details: 'AfO 25, 370',
    })
  })

  it('falls back to the entry id when no main word is present', () => {
    const [group] = groupAfoRegisterByVolume([
      afoRegisterEntryFactory.build({
        mainWord: '',
        afoVolume: 'AfO 25',
        year: '1977',
        page: '370',
      }),
    ])
    expect(formatAfoRegisterVolumeTitle('Enlil, Ellil', group)).toEqual({
      mainWord: 'Enlil, Ellil',
      details: 'AfO 25 (1977), 370',
    })
  })
})
