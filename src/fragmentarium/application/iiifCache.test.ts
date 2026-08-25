import Bluebird from 'bluebird'
import { IiifCache } from 'fragmentarium/application/iiifCache'
import { ScopedCache } from 'fragmentarium/application/scopedCache'
import {
  ImageInfoFetchResult,
  ManifestFetchResult,
} from 'fragmentarium/domain/iiifResult'
import { iiifOrigin } from 'test-support/iiif-fixtures/iiifFixtures'

const manifestUrl = `${iiifOrigin}/presentation/K.1/manifest`
const serviceId = `${iiifOrigin}/image/K.1`
const notFound: ManifestFetchResult = { status: 'not-found' }
const unavailable: ImageInfoFetchResult = { status: 'unavailable' }

let scope: string
let cache: IiifCache

beforeEach(() => {
  scope = 'guest'
  cache = new IiifCache(new ScopedCache(() => scope))
})

test('caches a manifest result', async () => {
  const fetchValue = jest.fn(() => Bluebird.resolve(notFound))
  await cache.manifest(manifestUrl, fetchValue)
  await cache.manifest(manifestUrl, fetchValue)
  expect(fetchValue).toHaveBeenCalledTimes(1)
})

test('keys manifests by url', async () => {
  const fetchValue = jest.fn(() => Bluebird.resolve(notFound))
  await cache.manifest(manifestUrl, fetchValue)
  await cache.manifest(`${manifestUrl}/other`, fetchValue)
  expect(fetchValue).toHaveBeenCalledTimes(2)
})

test('deduplicates in-flight manifest requests', async () => {
  const fetchValue = jest.fn(() => Bluebird.delay(1).then(() => notFound))
  const [first, second] = await Promise.all([
    cache.manifest(manifestUrl, fetchValue),
    cache.manifest(manifestUrl, fetchValue),
  ])
  expect(fetchValue).toHaveBeenCalledTimes(1)
  expect(first).toBe(second)
})

test('caches an image info result', async () => {
  const fetchValue = jest.fn(() => Bluebird.resolve(unavailable))
  await cache.imageInfo(serviceId, fetchValue)
  await cache.imageInfo(serviceId, fetchValue)
  expect(fetchValue).toHaveBeenCalledTimes(1)
})

test('clears cached manifests when the scope changes', async () => {
  const fetchValue = jest.fn(() => Bluebird.resolve(notFound))
  const imageInfoFetch = jest.fn(() => Bluebird.resolve(unavailable))
  await cache.manifest(manifestUrl, fetchValue)
  await cache.imageInfo(serviceId, imageInfoFetch)
  scope = 'signed-in'
  await cache.manifest(manifestUrl, fetchValue)
  await cache.imageInfo(serviceId, imageInfoFetch)
  expect(fetchValue).toHaveBeenCalledTimes(2)
  expect(imageInfoFetch).toHaveBeenCalledTimes(2)
})

test('clears a single manifest', async () => {
  const fetchValue = jest.fn(() => Bluebird.resolve(notFound))
  await cache.manifest(manifestUrl, fetchValue)
  cache.clearManifest(manifestUrl)
  await cache.manifest(manifestUrl, fetchValue)
  expect(fetchValue).toHaveBeenCalledTimes(2)
})
