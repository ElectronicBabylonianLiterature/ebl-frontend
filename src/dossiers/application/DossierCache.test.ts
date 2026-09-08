import DossierCache, {
  cacheEntryLifetimeInMilliseconds,
} from 'dossiers/application/DossierCache'
import DossierRecord from 'dossiers/domain/DossierRecord'

let currentTime: number
let cache: DossierCache

function record(id: string): DossierRecord {
  return new DossierRecord({ _id: id, references: [] })
}

beforeEach(() => {
  currentTime = 0
  cache = new DossierCache(() => currentTime, 2)
})

test('Reads back a record it has cached', () => {
  const dossier = record('a')
  cache.set(dossier)

  expect(cache.read('a')).toBe(dossier)
  expect(cache.hasFresh('a')).toBe(true)
})

test('Answers null for a record it does not hold', () => {
  expect(cache.read('missing')).toBeNull()
  expect(cache.hasFresh('missing')).toBe(false)
})

test('Drops a record once its entry has expired', () => {
  cache.set(record('a'))

  currentTime = cacheEntryLifetimeInMilliseconds

  expect(cache.read('a')).toBeNull()
  expect(cache.hasFresh('a')).toBe(false)
})

test('Evicts the least recently read record when full', () => {
  cache.set(record('a'))
  cache.set(record('b'))
  cache.read('a')
  cache.set(record('c'))

  expect(cache.read('b')).toBeNull()
  expect(cache.read('a')).not.toBeNull()
  expect(cache.read('c')).not.toBeNull()
})

test('Re-setting a record refreshes its expiry', () => {
  cache.set(record('a'))

  currentTime = cacheEntryLifetimeInMilliseconds - 1
  cache.set(record('a'))
  currentTime = cacheEntryLifetimeInMilliseconds

  expect(cache.read('a')).not.toBeNull()
})

test('Selects only the records it holds, in the order asked for', () => {
  const first = record('a')
  const second = record('b')
  cache.set(first)
  cache.set(second)

  expect(cache.select(['b', 'missing', 'a'])).toEqual([second, first])
})

test('Selects nothing when it holds nothing', () => {
  expect(cache.select(['a'])).toEqual([])
})

test('Clearing drops every record', () => {
  cache.set(record('a'))

  cache.clear()

  expect(cache.read('a')).toBeNull()
})
