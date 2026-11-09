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
