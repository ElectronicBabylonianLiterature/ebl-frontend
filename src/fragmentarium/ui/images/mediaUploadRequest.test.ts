import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import {
  uploadEntry,
  type UploadRuntime,
} from 'fragmentarium/ui/images/mediaUploadRequest'
import type { UploadEntry } from 'fragmentarium/ui/images/mediaUploadEntries'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { mediaMetadata } from 'http/uploadTransport.testSupport'

function context() {
  const upload = jest.fn()
  const runtime: UploadRuntime = {
    controllers: new Map(),
    mounted: { current: true },
    batchCancelled: { current: false },
    cancelledEntries: new Set(),
  }
  const entry: UploadEntry = {
    id: 'id',
    key: 'key',
    file: new File(['png'], 'a.png'),
    metadata: mediaMetadata,
    state: 'Ready to upload',
  }
  const management = { upload } as unknown as MediaManagementRepository
  return {
    entry,
    upload,
    options: {
      fragment: 'K.1',
      management,
      runtime,
      update: jest.fn(),
      onChanged: jest.fn(),
    },
  }
}

test('unavailable management, already active transfers and excessive metadata never dispatch uploads', async () => {
  const { entry, upload, options } = context()
  await uploadEntry(entry, { ...options, management: undefined })
  options.runtime.controllers.set(entry.id, new AbortController())
  await uploadEntry(entry, options)
  options.runtime.controllers.clear()
  await uploadEntry(
    {
      ...entry,
      metadata: { ...mediaMetadata, description: 'x'.repeat(20000) },
    },
    options,
  )
  expect(upload).not.toHaveBeenCalled()
  expect(options.update).not.toHaveBeenCalled()
  expect(options.onChanged).not.toHaveBeenCalled()
})

test('progress of unknown size remains indeterminate and late callbacks cannot revive a cancelled upload', async () => {
  const { entry, upload, options } = context()
  let resolve = (_value: ReturnType<typeof mediaFixture>): void => undefined
  upload.mockReturnValue(
    new Promise<ReturnType<typeof mediaFixture>>((done) => {
      resolve = done
    }),
  )
  const pending = uploadEntry(entry, options)
  const callbacks = upload.mock.calls[0][4]
  callbacks.onProgress(20, undefined)
  expect(options.update).toHaveBeenLastCalledWith(entry.id, {
    percent: undefined,
  })
  options.runtime.controllers.get(entry.id)!.abort()
  options.update.mockClear()
  callbacks.onProgress(100, 100)
  callbacks.onProcessing()
  resolve(mediaFixture({ publicationStatus: 'PUBLISHED' }))
  await pending
  expect(options.update).not.toHaveBeenCalled()
  expect(options.onChanged).not.toHaveBeenCalled()
  expect(options.runtime.controllers.size).toBe(0)
})
