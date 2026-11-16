import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import {
  file,
  fill,
  prepareUploadMocks,
  setup,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'

beforeEach(prepareUploadMocks)

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
