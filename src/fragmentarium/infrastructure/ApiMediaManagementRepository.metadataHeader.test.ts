import ApiMediaManagementRepository from './ApiMediaManagementRepository'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import {
  encodeMediaMetadataHeader,
  MEDIA_METADATA_TOO_LONG_MESSAGE,
} from 'fragmentarium/application/mediaMetadataHeader'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { ApiError } from 'http/ApiError'

const metadata: MediaMetadata = {
  type: 'PHOTO',
  caption: 'Obverse',
  sourceInstitution: 'Museum',
  rightsStatement: 'Permission granted',
  permissionAttested: true,
}
const api = { requestJson: jest.fn(), uploadBinary: jest.fn() }
const changed = jest.fn()
const file = new File(['jpeg'], 'tablet š.jpg', { type: 'image/jpeg' })

beforeEach(() => jest.clearAllMocks())

test('sends the header built by the shared encoder', async () => {
  api.uploadBinary.mockResolvedValue({ media: [mediaFixture()] })
  await new ApiMediaManagementRepository(api, changed).upload(
    'K.1',
    file,
    metadata,
    'key',
  )
  expect(api.uploadBinary.mock.calls[0][2]['X-Media-Metadata']).toBe(
    encodeMediaMetadataHeader(metadata, file.name),
  )
})

test('rejects oversized metadata client-side without sending a request', async () => {
  const upload = new ApiMediaManagementRepository(api, changed).upload(
    'K.1',
    file,
    { ...metadata, description: 'š'.repeat(3000) },
    'key',
  )
  await expect(upload).rejects.toBeInstanceOf(ApiError)
  await expect(upload).rejects.toMatchObject({
    message: MEDIA_METADATA_TOO_LONG_MESSAGE,
    status: 413,
  })
  expect(api.uploadBinary).not.toHaveBeenCalled()
  expect(changed).not.toHaveBeenCalled()
})
