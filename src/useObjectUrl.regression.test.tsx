import { renderHook } from '@testing-library/react'
import useObjectUrl from './common/useObjectUrl'

/**
 * Regression Tests for Blob URL Lifecycle Management
 *
 * Why these tests:
 * - Recent fix addressed memory leak where blob URLs weren't properly revoked
 * - URL.createObjectURL creates persistent references that must be cleaned up
 * - Component unmounts must revoke URLs to prevent browser memory exhaustion
 * - Multiple renders/updates must not leak intermediate blob URLs
 */

describe('useObjectUrl - Blob URL Lifecycle Regression Tests', () => {
  type BlobHookProps = { blob: Blob | null | undefined }
  type BlobHookResult = ReturnType<typeof useObjectUrl>

  const mockCreateObjectURL = jest.fn()
  const mockRevokeObjectURL = jest.fn()
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeAll(() => {
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = mockCreateObjectURL
    URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  beforeEach(() => {
    mockCreateObjectURL.mockClear()
    mockRevokeObjectURL.mockClear()
    mockCreateObjectURL.mockImplementation(
      (blob) => `blob:http://localhost/${Math.random()}`,
    )
  })

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
      unmount() // Second unmount should not throw

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

  describe('Edge Cases and Stability', () => {
    test('Same blob reference does not create new URL', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/same-ref'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, rerender } = renderHook(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob } },
      )

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
      const firstUrl = result.current

      rerender({ blob }) // Same blob reference

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1) // No additional call
      expect(result.current).toBe(firstUrl)
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })

    test('Empty blob handled correctly', () => {
      const emptyBlob = new Blob([], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/empty'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, unmount } = renderHook(() => useObjectUrl(emptyBlob))

      expect(mockCreateObjectURL).toHaveBeenCalledWith(emptyBlob)
      expect(result.current).toBe(blobUrl)

      unmount()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
    })

    test('Large blob handled without memory issues', () => {
      const largeBlob = new Blob([new ArrayBuffer(1024 * 1024)]) // 1MB
      const blobUrl = 'blob:http://localhost/large'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, unmount } = renderHook(() => useObjectUrl(largeBlob))

      expect(result.current).toBe(blobUrl)
      unmount()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
    })

    test('Alternating null and blob values', () => {
      const blob1 = new Blob(['1'], { type: 'text/plain' })
      const blob2 = new Blob(['2'], { type: 'text/plain' })
      const url1 = 'blob:http://localhost/alt-1'
      const url2 = 'blob:http://localhost/alt-2'

      mockCreateObjectURL.mockReturnValueOnce(url1).mockReturnValueOnce(url2)

      const { result, rerender } = renderHook<BlobHookResult, BlobHookProps>(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob: blob1 } },
      )

      expect(result.current).toBe(url1)

      rerender({ blob: null })
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url1)
      expect(result.current).toBeUndefined()

      rerender({ blob: blob2 })
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob2)
      expect(result.current).toBe(url2)

      rerender({ blob: null })
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url2)
      expect(result.current).toBeUndefined()

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration Scenarios', () => {
    test('Download button workflow - fetch, display, unmount', () => {
      // Simulates: user clicks download, blob fetched, URL created, modal shown, modal closed
      const fileBlob = new Blob(['file content'], { type: 'application/pdf' })
      const blobUrl = 'blob:http://localhost/download-file'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, unmount } = renderHook(() => useObjectUrl(fileBlob))

      expect(mockCreateObjectURL).toHaveBeenCalledWith(fileBlob)
      expect(result.current).toBe(blobUrl)

      // Simulate modal close/unmount
      unmount()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
    })

    test('Image preview workflow - multiple images loaded sequentially', () => {
      const images = [
        new Blob(['img1'], { type: 'image/jpeg' }),
        new Blob(['img2'], { type: 'image/jpeg' }),
        new Blob(['img3'], { type: 'image/jpeg' }),
      ]
      const urls = images.map((_, i) => `blob:http://localhost/img-${i}`)
      urls.forEach((url) => mockCreateObjectURL.mockReturnValueOnce(url))

      const { result, rerender } = renderHook(
        ({ blob }) => useObjectUrl(blob),
        { initialProps: { blob: images[0] } },
      )

      // User navigates through images
      images.slice(1).forEach((image, index) => {
        const prevUrl = result.current
        rerender({ blob: image })
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(prevUrl)
      })

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2)
      expect(result.current).toBe(urls[2])
    })

    test('Export/download feature - blob created then immediately revoked', () => {
      const exportBlob = new Blob(['export data'], { type: 'text/csv' })
      const blobUrl = 'blob:http://localhost/export'
      mockCreateObjectURL.mockReturnValue(blobUrl)

      const { result, unmount } = renderHook(() => useObjectUrl(exportBlob))

      expect(result.current).toBe(blobUrl)

      // Immediate unmount after triggering download
      unmount()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    test('createObjectURL throws - hook handles gracefully', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Out of memory')
      })

      expect(() => {
        renderHook(() => useObjectUrl(blob))
      }).toThrow('Out of memory')
    })

    test('revokeObjectURL throws - cleanup still completes', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const blobUrl = 'blob:http://localhost/revoke-error'
      mockCreateObjectURL.mockReturnValue(blobUrl)
      mockRevokeObjectURL.mockImplementation(() => {
        throw new Error('Invalid URL')
      })

      const { unmount } = renderHook(() => useObjectUrl(blob))

      expect(() => unmount()).toThrow('Invalid URL')
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl)
    })
  })
})
