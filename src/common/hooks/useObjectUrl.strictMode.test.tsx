import React from 'react'
import { renderHook } from '@testing-library/react'
import useObjectUrl from 'common/hooks/useObjectUrl'

test('keeps a live URL after StrictMode replay and releases every generation', () => {
  let sequence = 0
  const revoked = new Set<string>()
  jest
    .spyOn(URL, 'createObjectURL')
    .mockImplementation(() => `blob:${++sequence}`)
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    revoked.add(url)
  })
  const wrapper = ({
    children,
  }: {
    children: React.ReactNode
  }): JSX.Element => <React.StrictMode>{children}</React.StrictMode>
  const { result, rerender, unmount } = renderHook(
    ({ image }: { image: Blob }) => useObjectUrl(image),
    { wrapper, initialProps: { image: new Blob(['first']) } },
  )
  const firstUrl = result.current
  expect(firstUrl).toBeDefined()
  expect(revoked.has(firstUrl!)).toBe(false)
  expect(revoked.size).toBe(1)

  rerender({ image: new Blob(['second']) })

  expect(revoked.has(firstUrl!)).toBe(true)
  expect(revoked.has(result.current!)).toBe(false)
  unmount()
  expect(revoked.size).toBe(sequence)
})

test('never exposes a revoked URL when an earlier blob is reused after allocation fails', () => {
  let sequence = 0
  const revoked = new Set<string>()
  const staleUrls: string[] = []
  const failingImage = new Blob(['allocation fails'])
  jest.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    if (blob === failingImage) throw new Error('Allocation failed')
    return `blob:${++sequence}`
  })
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    revoked.add(url)
  })
  const image = new Blob(['reused'])
  const { rerender } = renderHook<string | undefined, { image: Blob | null }>(
    ({ image }: { image: Blob | null }) => {
      const url = useObjectUrl(image)
      if (url && revoked.has(url)) staleUrls.push(url)
      return url
    },
    { initialProps: { image } },
  )

  rerender({ image: null })
  rerender({ image })
  rerender({ image: failingImage })
  rerender({ image })

  expect(staleUrls).toEqual([])
})
