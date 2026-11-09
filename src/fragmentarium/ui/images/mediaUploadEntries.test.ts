import {
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
