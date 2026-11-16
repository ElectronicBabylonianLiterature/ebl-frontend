import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import {
  applyShared,
  file,
  fill,
  fillShared,
  pending,
  prepareUploadMocks,
  setup,
  submitOne,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'

beforeEach(prepareUploadMocks)

test('blurring unchanged optional metadata preserves the failed upload retry identity and payload', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network interrupted'))
    .mockResolvedValue(mediaFixture({ publicationStatus: 'PENDING_REVIEW' }))
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  const entry = within(
    screen.getByRole('region', { name: 'Upload obverse.png' }),
  )
  await userEvent.type(
    entry.getByLabelText('Bibliography identifiers (comma separated)'),
    'reference-one',
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await screen.findByRole('alert')
  await userEvent.click(
    entry.getByLabelText('Bibliography identifiers (comma separated)'),
  )
  await userEvent.tab()
  await userEvent.click(entry.getByLabelText(/Research projects/))
  await userEvent.tab()
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry obverse.png' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload.mock.calls[1][3]).toBe(upload.mock.calls[0][3])
  expect(upload.mock.calls[1][2]).toEqual(upload.mock.calls[0][2])
})

test('applying identical shared metadata to a failed entry keeps the retry identity', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network interrupted'))
    .mockResolvedValue(pending())
  setup(upload)
  await submitOne(upload)
  await screen.findByRole('alert')
  await fillShared()
  await applyShared()
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry obverse.png' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload.mock.calls[1][3]).toBe(upload.mock.calls[0][3])
  expect(upload.mock.calls[1][2]).toEqual(upload.mock.calls[0][2])
})

test('applying identical shared metadata to a cancelled entry keeps the retry identity', async () => {
  const upload: jest.Mock = jest.fn(
    (_fragment, _file, _metadata, _key, options) =>
      new Promise((resolve, reject) => {
        if (upload.mock.calls.length > 1) resolve(pending())
        else
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Cancelled', 'AbortError')),
          )
      }),
  )
  setup(upload)
  await submitOne(upload)
  await userEvent.click(
    screen.getByRole('button', { name: 'Cancel obverse.png' }),
  )
  await screen.findByRole('button', { name: 'Retry obverse.png' })
  await fillShared()
  await applyShared()
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry obverse.png' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload.mock.calls[1][3]).toBe(upload.mock.calls[0][3])
})

test('genuinely changed shared metadata gives a failed entry a new request identity', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network interrupted'))
    .mockResolvedValue(pending())
  setup(upload)
  await submitOne(upload)
  await screen.findByRole('alert')
  await fillShared('Changed caption')
  await applyShared()
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry obverse.png' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload.mock.calls[1][3]).not.toBe(upload.mock.calls[0][3])
  expect(upload.mock.calls[1][2].caption).toBe('Changed caption')
})

test('editing a failed entry rotates the identity and restoring the sent metadata restores it', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new Error('Network interrupted'))
    .mockRejectedValueOnce(new Error('Network interrupted'))
    .mockResolvedValue(pending())
  setup(upload)
  await submitOne(upload)
  await screen.findByRole('alert')
  const caption = () =>
    within(
      screen.getByRole('region', { name: 'Upload obverse.png' }),
    ).getByLabelText('Caption or short description')
  fireEvent.change(caption(), { target: { value: 'Edited' } })
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
  expect(upload.mock.calls[1][3]).not.toBe(upload.mock.calls[0][3])
  await screen.findByRole('alert')
  fireEvent.change(caption(), { target: { value: 'Obverse' } })
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(3))
  expect(upload.mock.calls[2][3]).toBe(upload.mock.calls[0][3])
})
