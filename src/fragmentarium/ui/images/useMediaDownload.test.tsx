import { act, renderHook, waitFor } from '@testing-library/react'
import { saveAs } from 'file-saver'
import useMediaDownload from 'fragmentarium/ui/images/useMediaDownload'
import {
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

test('deduplicates in-flight downloads and cleans up when unmounted', async () => {
  let resolveDownload: (blob: Blob) => void = () => undefined
  const loader = {
    fetch: jest.fn().mockImplementation(
      () =>
        new Promise<Blob>((resolve) => {
          resolveDownload = resolve
        }),
    ),
  }
  const { result, unmount } = renderHook(() =>
    useMediaDownload('K/1', mediaFixture(), loader),
  )
  act(() => {
    result.current.download()
    result.current.download()
  })
  expect(loader.fetch).toHaveBeenCalledTimes(1)
  expect(result.current.downloading).toBe(true)
  const signal = loader.fetch.mock.calls[0][1] as AbortSignal
  unmount()
  expect(signal.aborted).toBe(true)
  await act(async () => resolveDownload(imageBlob))
  expect(saveAs).not.toHaveBeenCalled()
})

test('reports failed downloads and permits retry', async () => {
  const error = new Error('Download failed')
  const loader = {
    fetch: jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(imageBlob),
  }
  const { result } = renderHook(() =>
    useMediaDownload('K/1', mediaFixture(), loader),
  )
  act(() => result.current.download())
  await waitFor(() => expect(result.current.error).toBe(error))
  expect(result.current.downloading).toBe(false)
  act(() => result.current.download())
  await waitFor(() =>
    expect(saveAs).toHaveBeenCalledWith(
      imageBlob,
      expect.stringContaining('eBL-K_1-'),
    ),
  )
  expect(result.current.error).toBeNull()
})

test('does not present cancellation as a download error', async () => {
  const loader = {
    fetch: jest
      .fn()
      .mockRejectedValue(new DOMException('Cancelled', 'AbortError')),
  }
  const { result } = renderHook(() =>
    useMediaDownload('K.1', mediaFixture(), loader),
  )
  act(() => result.current.download())
  await waitFor(() => expect(result.current.downloading).toBe(false))
  expect(result.current.error).toBeNull()
})
