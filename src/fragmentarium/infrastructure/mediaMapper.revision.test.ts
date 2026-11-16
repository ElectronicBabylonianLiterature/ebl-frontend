import { normalizeMediaResource } from 'fragmentarium/infrastructure/mediaMapper'

const validRepresentations = {
  original: {
    url: '/media/file',
    mimeType: 'image/jpeg',
  },
}

describe('media revision normalization', () => {
  const resource = {
    id: 'media-id',
    type: 'PHOTO',
    sortOrder: 0,
    isPrimary: false,
    representations: validRepresentations,
  }

  test.each([
    ['a lifecycle item', { publicationStatus: 'PENDING_REVIEW' }],
    ['a legacy item', {}],
  ])('keeps a non-negative integer revision on %s', (_name, lifecycle) => {
    for (const revision of [0, 7, Number.MAX_SAFE_INTEGER])
      expect(
        normalizeMediaResource({ ...resource, ...lifecycle, revision }),
      ).toMatchObject({ revision })
  })

  test.each([
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '3',
    null,
    true,
  ])('omits an invalid revision %p without rejecting the item', (revision) => {
    for (const lifecycle of [{ publicationStatus: 'PUBLISHED' }, {}]) {
      const media = normalizeMediaResource({
        ...resource,
        ...lifecycle,
        revision,
      })
      expect(media).toBeDefined()
      expect(media).not.toHaveProperty('revision')
    }
  })
})
