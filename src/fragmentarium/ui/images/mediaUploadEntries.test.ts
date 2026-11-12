import {
  mergeSharedMetadata,
  metadataTooLong,
  sameUploadMetadata,
  sharedUploadMetadata,
  withUploadMetadata,
  type UploadEntry,
} from './mediaUploadEntries'

beforeEach(() => {
  let counter = 0
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0)
        bytes[15] = ++counter
        return bytes
      },
    },
  })
})
const metadata = {
  type: 'PHOTO' as const,
  caption: 'Obverse',
  sourceInstitution: '',
  rightsStatement: 'Permission',
  permissionAttested: true,
}
const entry = (changes: Partial<UploadEntry> = {}): UploadEntry => ({
  id: 'id',
  key: 'original-key',
  file: new File(['x'], 'a.png', { type: 'image/png' }),
  metadata,
  state: 'Failed',
  ...changes,
})

test('compares effective metadata deeply, ignoring undefined optional fields', () => {
  expect(
    sameUploadMetadata(
      { ...metadata, references: [{ id: 'a' }], projects: ['CAIC'] },
      {
        ...metadata,
        creator: undefined,
        references: [{ id: 'a' }],
        projects: ['CAIC'],
      },
    ),
  ).toBe(true)
  expect(
    sameUploadMetadata(
      { ...metadata, references: [{ id: 'a' }] },
      { ...metadata, references: [{ id: 'b' }] },
    ),
  ).toBe(false)
  expect(sameUploadMetadata(metadata, { ...metadata, creator: '' })).toBe(false)
})
test('unchanged metadata returns the very same entry', () => {
  const failed = entry()
  expect(withUploadMetadata(failed, { ...metadata })).toBe(failed)
  expect(sharedUploadMetadata(failed, { ...metadata })).toBe(failed)
})
test('changed metadata rotates the key and restoring the attempted payload restores its key', () => {
  const sent = entry({ attempted: [{ key: 'original-key', metadata }] })
  const changed = withUploadMetadata(sent, { ...metadata, caption: 'Other' })
  expect(changed.key).not.toBe('original-key')
  expect(withUploadMetadata(changed, { ...metadata }).key).toBe('original-key')
})

const blankShared = {
  type: 'PHOTO' as const,
  caption: '',
  sourceInstitution: '',
  rightsStatement: '',
  permissionAttested: false,
}
test('applying a shared rights statement keeps per-entry description, creator and other fields', () => {
  const own = {
    ...metadata,
    type: 'COPY' as const,
    description: 'Lower edge',
    creator: 'A. Photographer',
    references: [{ id: 'RN1' }],
    projects: ['CAIC'],
  }
  const applied = sharedUploadMetadata(entry({ metadata: own }), {
    ...blankShared,
    rightsStatement: 'CC BY 4.0',
    creator: '   ',
    references: [],
  })
  expect(applied.metadata).toEqual({ ...own, rightsStatement: 'CC BY 4.0' })
  expect(applied.key).not.toBe('original-key')
})
test('filled shared fields override the entry', () => {
  const own = {
    ...metadata,
    permissionAttested: false,
    description: 'Lower edge',
    creator: 'A. Photographer',
    projects: ['CAIC'],
  }
  expect(
    mergeSharedMetadata(own, {
      ...blankShared,
      type: 'COPY',
      description: 'Shared context',
      creator: 'B. Creator',
      projects: ['AMPS'],
      references: [{ id: 'RN2' }],
      permissionAttested: true,
    }),
  ).toEqual({
    ...own,
    type: 'COPY',
    description: 'Shared context',
    creator: 'B. Creator',
    projects: ['AMPS'],
    references: [{ id: 'RN2' }],
    permissionAttested: true,
  })
})
test('a blank shared form leaves the entry and its retry identity untouched', () => {
  const failed = entry({
    metadata: { ...metadata, description: 'Lower edge' },
  })
  expect(sharedUploadMetadata(failed, blankShared)).toBe(failed)
})
test('flags entries whose encoded metadata exceeds the upload header limit', () => {
  expect(metadataTooLong(entry())).toBe(false)
  expect(
    metadataTooLong(
      entry({ metadata: { ...metadata, description: 'š'.repeat(3000) } }),
    ),
  ).toBe(true)
})
