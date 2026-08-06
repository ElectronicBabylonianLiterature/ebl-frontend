import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCache, {
  maximumCachedThumbnails,
} from 'fragmentarium/application/FragmentCache'
import {
  ImageRepository,
  ThumbnailBlob,
  ThumbnailSize,
} from 'fragmentarium/application/FragmentRepositoryTypes'

export default class FragmentImageLoader {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly cache: FragmentCache,
  ) {}

  findFolio(folio: Folio, signal?: AbortSignal): Promise<Blob> {
    return this.imageRepository.findFolio(folio, signal)
  }

  findImage(fileName: string): Promise<Blob> {
    return this.imageRepository.find(fileName)
  }

  findPhoto(fragment: Fragment, signal?: AbortSignal): Promise<Blob> {
    if (fragment.hasPhoto) {
      return this.imageRepository.findPhoto(fragment.number, signal)
    } else {
      throw Error(`Fragment ${fragment.number} doesn't have a Photo`)
    }
  }

  findThumbnail(
    fragment: Fragment,
    size: ThumbnailSize,
  ): Promise<ThumbnailBlob> {
    const cacheKey = this.cache.createThumbnailCacheKey(fragment.number, size)
    return this.cache.getOrFetch(
      this.cache.thumbnails,
      this.cache.thumbnailRequests,
      cacheKey,
      maximumCachedThumbnails,
      () =>
        this.cache.thumbnailFetchLimiter.run(() =>
          this.imageRepository.findThumbnail(fragment.number, size),
        ),
    )
  }
}
