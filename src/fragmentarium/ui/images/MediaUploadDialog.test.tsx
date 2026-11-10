import React from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaUploadDialog from './MediaUploadDialog'
import { galleryServices, mediaFixture } from './gallery.testSupport'
import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import { ApiError } from 'http/ApiError'

let counter = 0
beforeEach(() => {
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
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})
function setup(
  upload = jest
    .fn()
    .mockResolvedValue(mediaFixture({ publicationStatus: 'PENDING_REVIEW' })),
) {
  const services = {
    ...galleryServices([]),
    canUpload: true,
    management: { upload } as unknown as MediaManagementRepository,
  }
  const onChanged = jest.fn()
  const view = render(
    <MediaUploadDialog
      show
      onHide={jest.fn()}
      fragmentNumber="K.1"
      services={services}
      onChanged={onChanged}
    />,
  )
  return { ...view, upload, onChanged }
}
const file = (name = 'obverse.png') =>
  new File(['png'], name, { type: 'image/png' })
async function fill(name = 'obverse.png') {
  const entry = within(screen.getByRole('region', { name: `Upload ${name}` }))
  fireEvent.change(entry.getByLabelText('Caption or short description'), {
    target: { value: 'Obverse' },
  })
  fireEvent.change(entry.getByLabelText('Rights / reproduction statement'), {
    target: { value: 'Permission for eBL reproduction' },
  })
  await userEvent.click(entry.getByRole('checkbox'))
}
test('selects multiple images, validates metadata, submits and announces review status', async () => {
  const { upload, onChanged } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file(), file('reverse.png')],
  )
  expect(screen.getAllByAltText(/Preview of/)).toHaveLength(2)
  await fill()
  await fill('reverse.png')
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
  expect(await screen.findAllByText('Submitted for review')).toHaveLength(2)
  expect(onChanged).toHaveBeenCalledTimes(2)
  expect(upload.mock.calls[0][0]).toBe('K.1')
  expect(upload.mock.calls[0][2]).toMatchObject({
    permissionAttested: true,
    caption: 'Obverse',
  })
})
test('supports drop selection, removal and rejects unsupported files', async () => {
  setup()
  fireEvent.drop(screen.getByRole('group', { name: 'Image file selection' }), {
    dataTransfer: {
      files: [file(), new File(['svg'], 'bad.svg', { type: 'image/svg+xml' })],
    },
  })
  expect(screen.getByRole('alert')).toHaveTextContent('bad.svg')
  await userEvent.click(
    screen.getByRole('button', { name: 'Remove obverse.png' }),
  )
  expect(screen.queryByAltText(/Preview of/)).not.toBeInTheDocument()
  expect(URL.revokeObjectURL).toHaveBeenCalled()
})
test('uses truthful progress then processing without a percentage', async () => {
  let options
  const upload = jest.fn((_fragment, _file, _metadata, _key, callbacks) => {
    options = callbacks
    return new Promise(() => undefined)
  })
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  act(() => options.onProgress(3, 6))
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  act(() => options.onProcessing())
  expect(screen.getByText('Processing')).toBeVisible()
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
})
test('retries a failed file with the same idempotency key', async () => {
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
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Network interrupted',
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry obverse.png' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload.mock.calls[0][3]).toBe(upload.mock.calls[1][3])
})
test('cancels active transfers and does not start queued files', async () => {
  const signals: AbortSignal[] = []
  const upload = jest.fn(
    (_fragment, _file, _metadata, _key, options) =>
      new Promise((_resolve, reject) => {
        signals.push(options.signal)
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Cancelled', 'AbortError')),
        )
      }),
  )
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file('a.png'), file('b.png'), file('c.png')],
  )
  await fill('a.png')
  await fill('b.png')
  await fill('c.png')
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  expect(upload).toHaveBeenCalledTimes(2)
  await userEvent.click(screen.getByRole('button', { name: 'Cancel uploads' }))
  await waitFor(() =>
    expect(signals.every((signal) => signal.aborted)).toBe(true),
  )
  expect(upload).toHaveBeenCalledTimes(2)
  expect(
    within(screen.getByRole('region', { name: 'Upload c.png' })).getByRole(
      'status',
    ),
  ).toHaveTextContent('Cancelled')
})
test('unmount aborts uploads and prevents stale completion from refreshing another fragment', async () => {
  let resolve
  const upload = jest.fn(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const { unmount, onChanged } = setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  unmount()
  await act(async () => resolve(mediaFixture()))
  expect(onChanged).not.toHaveBeenCalled()
})

test('an individually cancelled queued file is skipped while later queued files still upload', async () => {
  const complete = new Map<
    string,
    (media: ReturnType<typeof mediaFixture>) => void
  >()
  const upload = jest.fn(
    (_fragment, selected: File, _metadata, _key, options) =>
      new Promise((resolve, reject) => {
        complete.set(selected.name, resolve)
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Cancelled', 'AbortError')),
        )
      }),
  )
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file('a.png'), file('b.png'), file('c.png'), file('d.png')],
  )
  await fill('a.png')
  await fill('b.png')
  await fill('c.png')
  await fill('d.png')
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  expect(upload).toHaveBeenCalledTimes(2)
  await userEvent.click(screen.getByRole('button', { name: 'Cancel c.png' }))
  expect(
    within(screen.getByRole('region', { name: 'Upload c.png' })).getByRole(
      'status',
    ),
  ).toHaveTextContent('Cancelled')
  await act(async () =>
    complete.get('a.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    ),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(3))
  expect(upload.mock.calls.map((call) => call[1].name)).toEqual([
    'a.png',
    'b.png',
    'd.png',
  ])
  await act(async () => {
    complete.get('b.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    )
    complete.get('d.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    )
  })
  expect(screen.getByRole('button', { name: 'Retry c.png' })).toBeEnabled()
})

test('selecting the same original again never creates an accidental duplicate upload entry', async () => {
  setup()
  const selected = file()
  const picker = screen.getByLabelText('Choose images or drop them here')
  await userEvent.upload(picker, selected)
  await userEvent.upload(picker, selected)
  expect(screen.getByRole('alert')).toHaveTextContent(
    'this file is already selected',
  )
  expect(
    screen.getAllByRole('region', { name: 'Upload obverse.png' }),
  ).toHaveLength(1)
  fireEvent.drop(screen.getByRole('group', { name: 'Image file selection' }), {
    dataTransfer: { files: [selected, selected] },
  })
  expect(screen.getAllByAltText('Preview of obverse.png')).toHaveLength(1)
})

test('a cancelled queued image can be retried explicitly without resubmitting completed images', async () => {
  const complete = new Map<
    string,
    (media: ReturnType<typeof mediaFixture>) => void
  >()
  const upload = jest.fn(
    (_fragment, selected: File, _metadata, _key, options) =>
      new Promise((resolve, reject) => {
        complete.set(selected.name, resolve)
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Cancelled', 'AbortError')),
        )
      }),
  )
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file('a.png'), file('b.png'), file('c.png')],
  )
  await fill('a.png')
  await fill('b.png')
  await fill('c.png')
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Cancel c.png' }))
  await act(async () => {
    complete.get('a.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    )
    complete.get('b.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    )
  })
  await userEvent.click(screen.getByRole('button', { name: 'Retry c.png' }))
  expect(upload.mock.calls.map((call) => call[1].name)).toEqual([
    'a.png',
    'b.png',
    'c.png',
  ])
  await act(async () =>
    complete.get('c.png')!(
      mediaFixture({ publicationStatus: 'PENDING_REVIEW' }),
    ),
  )
  expect(screen.getAllByText('Submitted for review')).toHaveLength(3)
})

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

async function fillShared(caption = 'Obverse') {
  // The shared fields precede every entry in document order.
  fireEvent.change(
    screen.getAllByLabelText('Caption or short description')[0],
    {
      target: { value: caption },
    },
  )
  fireEvent.change(
    screen.getAllByLabelText('Rights / reproduction statement')[0],
    { target: { value: 'Permission for eBL reproduction' } },
  )
  await userEvent.click(screen.getAllByRole('checkbox')[0])
}
async function submitOne(upload: jest.Mock) {
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
}
const applyShared = () =>
  userEvent.click(
    screen.getByRole('button', { name: 'Apply to selected images' }),
  )
const abortable = () =>
  jest.fn(
    (_fragment, _file, _metadata, _key, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Cancelled', 'AbortError')),
        ),
      ),
  )
const pending = () => mediaFixture({ publicationStatus: 'PENDING_REVIEW' })

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

test('cancelling an in-flight upload refreshes the gallery because the server may have committed it', async () => {
  const upload = abortable()
  const { onChanged } = setup(upload)
  await submitOne(upload)
  await userEvent.click(
    screen.getByRole('button', { name: 'Cancel obverse.png' }),
  )
  await screen.findByRole('button', { name: 'Retry obverse.png' })
  expect(onChanged).toHaveBeenCalledTimes(1)
  expect(screen.queryByText('Submitted for review')).not.toBeInTheDocument()
})

test('unmounting an in-flight upload never refreshes', async () => {
  const upload = abortable()
  const { onChanged, unmount } = setup(upload)
  await submitOne(upload)
  unmount()
  await act(async () => undefined)
  expect(onChanged).not.toHaveBeenCalled()
})

test.each([
  ['a network failure', new ApiError('Upload connection failed', {}, 0)],
  ['a gateway timeout', new ApiError('Gateway Timeout', {}, 504)],
  [
    'an unreadable response',
    new Error('The upload response could not be read.'),
  ],
])(
  'an upload failing with %s refreshes the gallery and keeps the retry',
  async (_name, error) => {
    const upload = jest.fn().mockRejectedValueOnce(error)
    const { onChanged } = setup(upload)
    await submitOne(upload)
    expect(await screen.findByRole('alert')).toHaveTextContent(error.message)
    expect(
      screen.getByRole('button', { name: 'Retry obverse.png' }),
    ).toBeVisible()
    expect(onChanged).toHaveBeenCalledTimes(1)
  },
)

test('an upload definitively rejected by the server does not refresh the gallery', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new ApiError('File too large', {}, 413))
  const { onChanged } = setup(upload)
  await submitOne(upload)
  expect(await screen.findByRole('alert')).toHaveTextContent('File too large')
  expect(onChanged).not.toHaveBeenCalled()
})

test('blocks an entry whose metadata is too long to upload and explains why', async () => {
  const { upload } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file(), file('reverse.png')],
  )
  await fill()
  await fill('reverse.png')
  const entry = within(
    screen.getByRole('region', { name: 'Upload obverse.png' }),
  )
  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'š'.repeat(2000) },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'ṣ'.repeat(2000) },
  })
  const tooLong = entry.getByRole('alert')
  expect(tooLong).toHaveTextContent(
    "obverse.png: This image's metadata is too long to upload. Shorten the description, caption or other text fields.",
  )
  expect(entry.getByLabelText('Additional context')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  expect(entry.getByLabelText('Additional context')).toHaveAttribute(
    'aria-describedby',
    tooLong.id,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload).toHaveBeenCalledTimes(1)
  expect(upload.mock.calls[0][1].name).toBe('reverse.png')
  expect(entry.getByText('Ready to upload')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Submit images for review' }),
  ).toBeDisabled()

  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'Lower edge' },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'A. Photographer' },
  })
  expect(entry.queryByRole('alert')).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
  expect(upload.mock.calls[1][2].description).toBe('Lower edge')
})

test('applying shared rights keeps each image’s own description and creator', async () => {
  const { upload } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  const entry = within(
    screen.getByRole('region', { name: 'Upload obverse.png' }),
  )
  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'Lower edge' },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'A. Photographer' },
  })
  fireEvent.change(
    screen.getAllByLabelText('Rights / reproduction statement')[0],
    { target: { value: 'CC BY 4.0' } },
  )
  await applyShared()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
  expect(upload.mock.calls[0][2]).toMatchObject({
    caption: 'Obverse',
    description: 'Lower edge',
    creator: 'A. Photographer',
    rightsStatement: 'CC BY 4.0',
    permissionAttested: true,
  })
})
