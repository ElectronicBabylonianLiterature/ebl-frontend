import { stringify } from 'query-string'
import { FragmentQuery } from 'query/FragmentQuery'
import { ThumbnailSize } from 'fragmentarium/application/fragmentServicePorts'

export const latestQueryCacheKey = 'latest:'
export const provenanceCacheKey = 'provenance:'

export function fragmentKeyPrefix(number: string): string {
  return `${number.length}:${number}:`
}

export function fragmentKey(
  number: string,
  lines?: readonly number[],
  excludeLines?: boolean,
): string {
  return `${fragmentKeyPrefix(number)}${(lines ?? []).join(',')}:${
    excludeLines === true
  }`
}

export function queryKey(fragmentQuery: FragmentQuery): string {
  return `query:${stringify(fragmentQuery)}`
}

export function thumbnailKey(number: string, size: ThumbnailSize): string {
  return `${number.length}:${number}:${size}`
}

export function manifestKey(manifestUrl: string): string {
  return `manifest:${manifestUrl}`
}

export function imageInfoKey(serviceId: string): string {
  return `imageInfo:${serviceId}`
}

export function deleteByPrefix<CacheValue>(
  cache: Map<string, CacheValue>,
  prefix: string,
): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}
