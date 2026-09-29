import { renderHook } from '@testing-library/react'
import useObjectUrl from 'common/hooks/useObjectUrl'
import { setupObjectUrlMocks } from 'common/hooks/useObjectUrl.regression.testSupport'

describe('useObjectUrl - Blob URL Lifecycle Regression Tests', () => {
  type BlobHookProps = { blob: Blob | null | undefined }
  type BlobHookResult = ReturnType<typeof useObjectUrl>

  const { mockCreateObjectURL, mockRevokeObjectURL } = setupObjectUrlMocks()

  describe('Basic Lifecycle', () => {
    test('Creates blob URL when blob provided', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      mockCreateObjectURL.mockReturnValue('blob:http://localhost/test-url')

      const { result } = renderHook(() => useObjectUrl(blob))

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(result.current).toBe('blob:http://localhost/test-url')
    })

    test('Returns undefined when no blob provided', () => {
      const { result } = renderHook(() => useObjectUrl(null))

      expect(mockCreateObjectURL).not.toHaveBeenCalled()
      expect(result.current).toBeUndefined()
    })

    test('Returns undefined when undefined blob provided', () => {
      const { result } = renderHook(() => useObjectUrl(undefined))

      expect(mockCreateObjectURL).not.toHaveBeenCalled()
      expect(result.current).toBeUndefined()
    })
  })

  describe('Cleanup on Unmount - Memory Leak Prevention', () => {
    test('Revokes blob URL when component unmounts', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/unmount-test'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { unmount } = renderHook(() => useObjectUrl(blob))

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()

      unmount()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1)
    })

    test('Does not revoke if no blob URL was created', () => {
      const { unmount } = renderHook(() => useObjectUrl(null))

      unmount()

      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })

    test('Handles multiple unmounts without error', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/multi-unmount'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { unmount } = renderHook(() => useObjectUrl(blob))
      unmount()
      unmount()

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1)
    })
  })

  describe('Blob Changes - Intermediate URL Cleanup', () => {
    test('Revokes old URL when blob changes', () => {
      const blob1 = new Blob(['first'], { type: 'text/plain' })
      const blob2 = new Blob(['second'], { type: 'text/plain' })
      const url1 = 'blob:http://localhost/first'
      const url2 = 'blob:http://localhost/second'

      mockCreateObjectURL.mockReturnValueOnce(url1).mockReturnValueOnce(url2)

      const { result, rerender } = renderHook(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob: blob1 } },
      )

      expect(result.current).toBe(url1)
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()

      rerender({ blob: blob2 })

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url1)
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob2)
      expect(result.current).toBe(url2)
    })

    test('Revokes URL when blob changes to null', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/to-null'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, rerender } = renderHook<BlobHookResult, BlobHookProps>(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob } },
      )

      expect(result.current).toBe(blobUrl)

      rerender({ blob: null })

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
      expect(result.current).toBeUndefined()
    })

    test('Creates URL when blob changes from null to value', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/from-null'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, rerender } = renderHook<BlobHookResult, BlobHookProps>(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob: null } },
      )

      expect(result.current).toBeUndefined()

      rerender({ blob })

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(result.current).toBe(blobUrl)
    })

    test('Multiple rapid blob changes revoke all intermediate URLs', () => {
      const blobs = [
        new Blob(['1'], { type: 'text/plain' }),
        new Blob(['2'], { type: 'text/plain' }),
        new Blob(['3'], { type: 'text/plain' }),
        new Blob(['4'], { type: 'text/plain' }),
      ]
      const urls = blobs.map((_, i) => `blob:http://localhost/rapid-${i}`)

      urls.forEach((url) => mockCreateObjectURL.mockReturnValueOnce(url))

      const { result, rerender } = renderHook(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob: blobs[0] } },
      )

      expect(result.current).toBe(urls[0])

      blobs.slice(1).forEach((blob, index) => {
        rerender({ blob })
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(urls[index])
      })

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(3)
      expect(result.current).toBe(urls[3])
    })
  })
})
