import { IiifDocument, IiifReference } from 'fragmentarium/domain/iiifDocument'
import { IiifMediaResource } from 'fragmentarium/domain/iiifMedia'
import {
  isUsableManifest,
  ManifestFetchResult,
} from 'fragmentarium/domain/iiifResult'
import type { MediaResource } from 'fragmentarium/domain/media'

export const MediaSourceKinds = [
  'iiif',
  'media-endpoint',
  'legacy-photo',
  'none',
] as const

export type MediaSourceKind = (typeof MediaSourceKinds)[number]

export const LegacyFallbackReasons = [
  'NO_IIIF_REFERENCE',
  'MANIFEST_INVALID',
  'MANIFEST_UNAVAILABLE',
  'MANIFEST_UNAUTHORIZED',
] as const

export type LegacyFallbackReason = (typeof LegacyFallbackReasons)[number]

export const MediaEndpointFallbackReasons = [
  'MEDIA_EMPTY',
  'MEDIA_INVALID',
  'MEDIA_UNAVAILABLE',
] as const

export type MediaEndpointFallbackReason =
  (typeof MediaEndpointFallbackReasons)[number]

export type MediaEndpointResult =
  | { readonly status: 'ok'; readonly media: readonly MediaResource[] }
  | { readonly status: 'empty' }
  | { readonly status: 'invalid' }
  | { readonly status: 'unavailable' }

export type ResolvedMediaResource = IiifMediaResource | MediaResource

export interface LegacyMediaFallback {
  readonly reason: LegacyFallbackReason
  readonly source: Exclude<MediaSourceKind, 'iiif'>
  readonly mediaEndpointReason?: MediaEndpointFallbackReason
}

export interface ResolvedFragmentMedia {
  readonly source: MediaSourceKind
  readonly document?: IiifDocument
  readonly media: readonly ResolvedMediaResource[]
  readonly fallback?: LegacyMediaFallback
}

export interface FragmentMediaSources {
  readonly iiif?: IiifReference
  readonly manifest?: ManifestFetchResult
  readonly mediaEndpoint?: MediaEndpointResult
  readonly hasPhoto: boolean
}

function fallbackReason(sources: FragmentMediaSources): LegacyFallbackReason {
  if (sources.iiif === undefined || sources.manifest === undefined) {
    return 'NO_IIIF_REFERENCE'
  }
  if (sources.manifest.status === 'invalid') {
    return 'MANIFEST_INVALID'
  }
  return sources.manifest.status === 'unauthorized'
    ? 'MANIFEST_UNAUTHORIZED'
    : 'MANIFEST_UNAVAILABLE'
}

function usableMediaEndpoint(
  mediaEndpoint: MediaEndpointResult | undefined,
): readonly MediaResource[] | undefined {
  return mediaEndpoint?.status === 'ok' && mediaEndpoint.media.length > 0
    ? mediaEndpoint.media
    : undefined
}

function mediaEndpointFallbackReason(
  mediaEndpoint: MediaEndpointResult | undefined,
): MediaEndpointFallbackReason | undefined {
  if (mediaEndpoint === undefined) {
    return undefined
  }
  if (mediaEndpoint.status === 'invalid') {
    return 'MEDIA_INVALID'
  }
  return mediaEndpoint.status === 'unavailable'
    ? 'MEDIA_UNAVAILABLE'
    : 'MEDIA_EMPTY'
}

function toFallback(
  sources: FragmentMediaSources,
  source: Exclude<MediaSourceKind, 'iiif'>,
  mediaEndpointReason?: MediaEndpointFallbackReason,
): LegacyMediaFallback {
  const reason = fallbackReason(sources)
  return mediaEndpointReason === undefined
    ? { reason, source }
    : { reason, source, mediaEndpointReason }
}

function resolveWithoutManifest(
  sources: FragmentMediaSources,
): ResolvedFragmentMedia {
  const media = usableMediaEndpoint(sources.mediaEndpoint)
  if (media !== undefined) {
    return {
      source: 'media-endpoint',
      media,
      fallback: toFallback(sources, 'media-endpoint'),
    }
  }

  const source: Exclude<MediaSourceKind, 'iiif'> = sources.hasPhoto
    ? 'legacy-photo'
    : 'none'
  return {
    source,
    media: [],
    fallback: toFallback(
      sources,
      source,
      mediaEndpointFallbackReason(sources.mediaEndpoint),
    ),
  }
}

export function resolveFragmentMedia(
  sources: FragmentMediaSources,
): ResolvedFragmentMedia {
  const manifest = sources.manifest
  if (
    sources.iiif !== undefined &&
    manifest !== undefined &&
    isUsableManifest(manifest)
  ) {
    return {
      source: 'iiif',
      document: manifest.document,
      media: manifest.document.media,
    }
  }
  return resolveWithoutManifest(sources)
}
