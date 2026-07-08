import { MediaResource } from './media'

export interface MediaGalleryState {
  readonly selectedMediaId: string | null
}

export function sortMedia(
  media: readonly MediaResource[],
): readonly MediaResource[] {
  return media
    .map((resource, index) => ({ resource, index }))
    .sort(
      (left, right) =>
        left.resource.sortOrder - right.resource.sortOrder ||
        left.index - right.index,
    )
    .map(({ resource }) => resource)
}

export function selectInitialMedia(
  media: readonly MediaResource[],
): MediaResource | null {
  const orderedMedia = sortMedia(media)
  return (
    orderedMedia.find((resource) => resource.isPrimary) ??
    orderedMedia[0] ??
    null
  )
}

export function selectMediaById(
  media: readonly MediaResource[],
  id: string,
): MediaResource | null {
  return sortMedia(media).find((resource) => resource.id === id) ?? null
}
