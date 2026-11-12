import { FragmentCache } from './fragmentCache'
import { fragmentKey, thumbnailKey } from './fragmentCacheKeys'
import { fragmentFactory } from 'test-support/fragment-fixtures'

test('media invalidation refreshes only affected fragment, thumbnails and cached result membership', async () => {
  const cache = new FragmentCache(() => 'user')
  const a = fragmentFactory.build({ number: 'K.1' })
  const b = fragmentFactory.build({ number: 'K.2' })
  const fetchA = jest.fn().mockResolvedValue(a)
  const fetchB = jest.fn().mockResolvedValue(b)
  const fetchThumbA = jest.fn().mockResolvedValue({ blob: new Blob(['a']) })
  const fetchThumbB = jest.fn().mockResolvedValue({ blob: new Blob(['b']) })
  const resultA = jest.fn().mockResolvedValue({
    items: [{ museumNumber: 'K.1', matchingLines: [], matchCount: 0 }],
    matchCountTotal: 1,
  })
  const resultB = jest.fn().mockResolvedValue({
    items: [{ museumNumber: 'K.2', matchingLines: [], matchCount: 0 }],
    matchCountTotal: 1,
  })
  const read = async (): Promise<void> => {
    await cache.fragment(fragmentKey(a.number), fetchA)
    await cache.fragment(fragmentKey(b.number), fetchB)
    await cache.thumbnail(thumbnailKey(a.number, 'small'), fetchThumbA)
    await cache.thumbnail(thumbnailKey(b.number, 'small'), fetchThumbB)
    await cache.queryResult('a', resultA)
    await cache.queryResult('b', resultB)
  }
  await read()
  cache.invalidateMedia(a.number)
  await read()
  for (const affected of [fetchA, fetchThumbA, resultA])
    expect(affected).toHaveBeenCalledTimes(2)
  for (const unaffected of [fetchB, fetchThumbB, resultB])
    expect(unaffected).toHaveBeenCalledTimes(1)
})

test('old thumbnail request cannot repopulate an invalidated media cache', async () => {
  const cache = new FragmentCache(() => 'user')
  const key = thumbnailKey('K.1', 'small')
  let finish: (value: { blob: Blob }) => void = () => undefined
  const old = cache.thumbnail(
    key,
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  cache.invalidateMedia('K.1')
  const current = { blob: new Blob(['new']) }
  await cache.thumbnail(key, async () => current)
  finish({ blob: new Blob(['old']) })
  await old
  await expect(cache.thumbnail(key, jest.fn())).resolves.toBe(current)
})
