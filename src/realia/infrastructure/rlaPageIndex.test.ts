/* eslint-disable camelcase -- DT_RowId mirrors the badw index JSON field */
import {
  RLA_INDEX_URL,
  clearRlaPageIndexCache,
  loadRlaPageIndex,
  parseRlaPageIndex,
  rlaImageUrl,
} from 'realia/infrastructure/rlaPageIndex'

type IndexRows = Parameters<typeof parseRlaPageIndex>[0]

function row(id: number, path: string, page: string): IndexRows[number] {
  return {
    DT_RowId: id,
    '0': {
      _: `<div hidden="">X</div> X <a onclick="rI(event,'${path}',7)">S.\u202f${page}`,
    },
  }
}

const rows: IndexRows = [
  row(6603, 'a/6.92.jpg', '59'),
  row(6610, 'a/6.98.jpg', '65'),
  row(700, 'a/1.18.jpg', '1'),
  { DT_RowId: 999, '6': { _: '<a onclick="rowAt(6603)">x</a>' } },
  { DT_RowId: 998, '0': { _: 'cross-reference lemma without a page image' } },
  { DT_RowId: 997, '0': 5 },
  {
    DT_RowId: 696,
    '0': { _: `<a onclick="rI(event,'a/2.5.jpg',7)">no label` },
  },
]

describe('rlaImageUrl', () => {
  it('builds the badw page-image url from volume and scan', () => {
    expect(rlaImageUrl('6', 92)).toBe(
      'https://publikationen.badw.de/de/rla/a/6.92.jpg',
    )
  })
})

describe('parseRlaPageIndex', () => {
  const index = parseRlaPageIndex(rows)

  it('includes the shared boundary page of the next article in the range', () => {
    expect(index.get('6603')).toEqual({
      volume: '6',
      startScan: 92,
      endScan: 98,
      pageLabel: '59',
    })
  })

  it('bounds the last article in a volume to its own start scan', () => {
    expect(index.get('6610')?.endScan).toBe(98)
  })

  it('keeps volumes independent when computing page ranges', () => {
    expect(index.get('700')).toMatchObject({ volume: '1', startScan: 18 })
  })

  it('leaves the page label empty when the markup has no "S." reference', () => {
    expect(index.get('696')).toMatchObject({ volume: '2', pageLabel: '' })
  })

  it('skips rows without a page image', () => {
    expect(index.has('999')).toBe(false)
    expect(index.has('998')).toBe(false)
    expect(index.has('997')).toBe(false)
  })
})

describe('loadRlaPageIndex', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    clearRlaPageIndexCache()
  })

  it('fetches the badw index once and caches the parsed result', async () => {
    fetchMock.mockResponse(JSON.stringify({ data: rows }))
    const first = await loadRlaPageIndex()
    const second = await loadRlaPageIndex()
    expect(first.get('6603')?.startScan).toBe(92)
    expect(second).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(RLA_INDEX_URL)
  })

  it('rejects and clears the cache on a failed response', async () => {
    fetchMock.mockResponseOnce('', { status: 502 })
    await expect(loadRlaPageIndex()).rejects.toThrow('502')
    fetchMock.mockResponse(JSON.stringify({ data: rows }))
    await expect(loadRlaPageIndex()).resolves.toBeInstanceOf(Map)
  })

  it('yields an empty index when the response has no data array', async () => {
    fetchMock.mockResponse(JSON.stringify({}))
    const index = await loadRlaPageIndex()
    expect(index.size).toBe(0)
  })
})
