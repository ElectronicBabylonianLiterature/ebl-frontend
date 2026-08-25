import Bluebird from 'bluebird'
import { CacheEntry } from 'common/utils/cache'
import {
  ImageInfoFetchResult,
  ManifestFetchResult,
} from 'fragmentarium/domain/iiifResult'
import { ScopedCache } from 'fragmentarium/application/scopedCache'
import {
  imageInfoKey,
  manifestKey,
} from 'fragmentarium/application/fragmentCacheKeys'

export const maximumCachedManifests = 50
export const maximumCachedImageInfos = 200

export class IiifCache {
  private readonly scoped: ScopedCache
  private readonly manifests: Map<string, CacheEntry<ManifestFetchResult>>
  private readonly manifestRequests: Map<string, Bluebird<ManifestFetchResult>>
  private readonly imageInfos: Map<string, CacheEntry<ImageInfoFetchResult>>
  private readonly imageInfoRequests: Map<
    string,
    Bluebird<ImageInfoFetchResult>
  >

  constructor(scoped: ScopedCache) {
    this.scoped = scoped
    this.manifests = scoped.register(new Map())
    this.manifestRequests = scoped.register(new Map())
    this.imageInfos = scoped.register(new Map())
    this.imageInfoRequests = scoped.register(new Map())
  }

  manifest(
    manifestUrl: string,
    fetchValue: () => Bluebird<ManifestFetchResult>,
  ): Bluebird<ManifestFetchResult> {
    return this.scoped.getOrFetch(
      this.manifests,
      this.manifestRequests,
      manifestKey(manifestUrl),
      maximumCachedManifests,
      fetchValue,
    )
  }

  imageInfo(
    serviceId: string,
    fetchValue: () => Bluebird<ImageInfoFetchResult>,
  ): Bluebird<ImageInfoFetchResult> {
    return this.scoped.getOrFetch(
      this.imageInfos,
      this.imageInfoRequests,
      imageInfoKey(serviceId),
      maximumCachedImageInfos,
      fetchValue,
    )
  }

  clearManifest(manifestUrl: string): void {
    const key = manifestKey(manifestUrl)
    this.manifests.delete(key)
    this.manifestRequests.delete(key)
  }
}
