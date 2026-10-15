import { MediaResource } from 'fragmentarium/domain/media'
import {
  selectInitialMedia,
  selectMediaById,
  sortMedia,
} from 'fragmentarium/domain/mediaGallery'

function createMediaResource(
  overrides: Partial<MediaResource>,
  id: string,
): MediaResource {
  return {
    id,
    type: 'PHOTO',
    sortOrder: 0,
    isPrimary: false,
    references: [],
    representations: {
      original: {
        url: `/media/${id}`,
        mimeType: 'image/jpeg',
      },
      thumbnails: {},
    },
    ...overrides,
  }
}

describe('media gallery helpers', () => {
  test('sorts media by fragment-specific order', () => {
    const media = [
      createMediaResource({ sortOrder: 2 }, 'third'),
      createMediaResource({ sortOrder: 0 }, 'first'),
      createMediaResource({ sortOrder: 1 }, 'second'),
    ]

    expect(sortMedia(media).map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
    ])
  })

  test('preserves stable input order for equal sort orders', () => {
    const media = [
      createMediaResource({ sortOrder: 1 }, 'first'),
      createMediaResource({ sortOrder: 1 }, 'second'),
      createMediaResource({ sortOrder: 1 }, 'third'),
    ]

    expect(sortMedia(media).map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
    ])
  })

  test('prefers the first primary photo over an earlier primary copy', () => {
    const media = [
      createMediaResource(
        { sortOrder: 0, isPrimary: true, type: 'COPY' },
        'primary-copy',
      ),
      createMediaResource(
        { sortOrder: 1, isPrimary: true, type: 'PHOTO' },
        'primary-photo',
      ),
    ]

    expect(selectInitialMedia(media)?.id).toBe('primary-photo')
  })

  test('selects the first primary media item after sorting', () => {
    const media = [
      createMediaResource({ sortOrder: 2 }, 'late'),
      createMediaResource({ sortOrder: 0, isPrimary: true }, 'primary'),
      createMediaResource({ sortOrder: 1 }, 'middle'),
    ]

    expect(selectInitialMedia(media)?.id).toBe('primary')
  })

  test('selects the first primary item in sorted order without mutating input', () => {
    const media = [
      createMediaResource({ sortOrder: 2, isPrimary: true }, 'late-primary'),
      createMediaResource({ sortOrder: 0 }, 'first'),
      createMediaResource({ sortOrder: 1, isPrimary: true }, 'early-primary'),
    ]
    const inputOrder = media.map(({ id }) => id)

    expect(selectInitialMedia(media)?.id).toBe('early-primary')
    expect(media.map(({ id }) => id)).toEqual(inputOrder)
  })

  test('falls back to the first ordered media item when no primary exists', () => {
    const media = [
      createMediaResource({ sortOrder: 1 }, 'second'),
      createMediaResource({ sortOrder: 0 }, 'first'),
    ]

    expect(selectInitialMedia(media)?.id).toBe('first')
  })

  test('returns null for an empty gallery', () => {
    expect(selectInitialMedia([])).toBeNull()
    expect(selectMediaById([], 'missing')).toBeNull()
  })
})

describe('selectMediaById', () => {
  test('returns null when no item matches', () => {
    const media = [
      createMediaResource({}, 'first'),
      createMediaResource({}, 'second'),
    ]

    expect(selectMediaById(media, 'missing')).toBeNull()
  })

  test('returns the single matching item', () => {
    const media = [
      createMediaResource({}, 'first'),
      createMediaResource({}, 'second'),
    ]

    expect(selectMediaById(media, 'second')?.id).toBe('second')
  })

  test('returns the first match without sorting when ids are duplicated', () => {
    const media = [
      createMediaResource({ sortOrder: 5 }, 'duplicate'),
      createMediaResource({ sortOrder: 0 }, 'duplicate'),
    ]

    expect(selectMediaById(media, 'duplicate')).toBe(media[0])
  })

  test('does not mutate or reorder the input array', () => {
    const media = [
      createMediaResource({ sortOrder: 2 }, 'third'),
      createMediaResource({ sortOrder: 0 }, 'first'),
      createMediaResource({ sortOrder: 1 }, 'second'),
    ]
    const inputOrder = media.map(({ id }) => id)

    selectMediaById(media, 'second')

    expect(media.map(({ id }) => id)).toEqual(inputOrder)
  })

  test('supports a frozen, readonly input array', () => {
    const media = Object.freeze([createMediaResource({}, 'only')])

    expect(selectMediaById(media, 'only')?.id).toBe('only')
  })
})
