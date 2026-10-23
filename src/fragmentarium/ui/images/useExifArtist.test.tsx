import { act, renderHook } from '@testing-library/react'
import useExifArtist from 'fragmentarium/ui/images/useExifArtist'

const callbacks: Array<() => void> = []
const mockGetTag = jest.fn()
const mockGetData = jest.fn((_photo: Blob, callback: () => void) =>
  callbacks.push(callback),
)
jest.mock('exif-js', () => ({
  getData: (photo: Blob, callback: () => void) => mockGetData(photo, callback),
  getTag: () => mockGetTag(),
}))

beforeEach(() => {
  callbacks.length = 0
  mockGetData.mockImplementation((_photo: Blob, callback: () => void) =>
    callbacks.push(callback),
  )
  mockGetTag.mockReset()
})

test('ignores missing EXIF and resets when the image changes', () => {
  mockGetTag.mockReturnValueOnce('Photographer').mockReturnValueOnce(undefined)
  const { result, rerender } = renderHook(
    ({ photo }: { photo?: Blob }) => useExifArtist(photo),
    { initialProps: { photo: new Blob(['first']) } },
  )
  act(() => callbacks[0]())
  expect(result.current).toBe('Photographer')
  rerender({ photo: new Blob(['second']) })
  expect(result.current).toBeUndefined()
  act(() => callbacks[1]())
  expect(result.current).toBeUndefined()
})

test('does not reuse an EXIF callback after the selection changes', () => {
  mockGetTag.mockReturnValue('Old credit')
  const { result, rerender, unmount } = renderHook(
    ({ photo }: { photo?: Blob }) => useExifArtist(photo),
    { initialProps: { photo: new Blob(['first']) } },
  )
  rerender({ photo: new Blob(['second']) })
  act(() => callbacks[0]())
  expect(result.current).toBeUndefined()
  unmount()
  act(() => callbacks[1]())
})

test('does not inspect a missing original', () => {
  const { result } = renderHook(() => useExifArtist())
  expect(result.current).toBeUndefined()
  expect(mockGetData).not.toHaveBeenCalled()
})
