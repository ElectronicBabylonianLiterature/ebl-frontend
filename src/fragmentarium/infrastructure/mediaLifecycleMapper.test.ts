import { normalizeLifecycle } from 'fragmentarium/infrastructure/mediaLifecycleMapper'

test('keeps annotated legacy rights without fabricating lifecycle or private review metadata', () => {
  expect(
    normalizeLifecycle({
      rightsAnnotated: true,
      creator: 'Photographer',
      rightsStatement: 'Permission',
      uploaderId: 'private',
      permissionAttested: true,
      revision: 0,
    }),
  ).toEqual({
    rightsAnnotated: true,
    creator: 'Photographer',
    rightsStatement: 'Permission',
    revision: 0,
  })
  expect(
    normalizeLifecycle({ creator: 'Unannotated', rightsAnnotated: false }),
  ).toEqual({})
})

test('accepts only string projects and independently validates rights, attestation and revision', () => {
  expect(
    normalizeLifecycle({
      publicationStatus: 'PENDING_REVIEW',
      projects: ['CAIC', 'RECC'],
      permissionAttested: false,
      creator: 'Creator',
      rightsStatement: 42,
      revision: 3,
    }),
  ).toEqual({
    publicationStatus: 'PENDING_REVIEW',
    projects: ['CAIC', 'RECC'],
    permissionAttested: false,
    creator: 'Creator',
    revision: 3,
  })
  expect(
    normalizeLifecycle({
      publicationStatus: 'PUBLISHED',
      projects: ['CAIC', 3],
      permissionAttested: 'yes',
      revision: -1,
    }),
  ).toEqual({ publicationStatus: 'PUBLISHED' })
  expect(
    normalizeLifecycle({ publicationStatus: 'REJECTED', projects: 'CAIC' }),
  ).toEqual({ publicationStatus: 'REJECTED' })
  expect(normalizeLifecycle({ publicationStatus: 'UNKNOWN' })).toBeUndefined()
})
