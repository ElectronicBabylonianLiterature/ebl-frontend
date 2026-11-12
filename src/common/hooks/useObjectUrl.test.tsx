import React from 'react'
import { render, screen } from '@testing-library/react'
import useObjectUrl from './useObjectUrl'

test('StrictMode replays create a fresh live URL and release every generation', () => {
  let next = 0
  const revoked = new Set<string>()
  jest.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:${++next}`)
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    revoked.add(url)
  })
  function Preview({ image }: { image: Blob }) {
    const url = useObjectUrl(image)
    return <img src={url} alt="Test tablet" />
  }
  const first = new Blob(['first'])
  const { rerender, unmount } = render(
    <React.StrictMode>
      <Preview image={first} />
    </React.StrictMode>,
  )
  const live = screen.getByAltText('Test tablet').getAttribute('src')!
  expect(revoked.has(live)).toBe(false)
  expect(revoked.size).toBe(1)
  rerender(
    <React.StrictMode>
      <Preview image={new Blob(['next'])} />
    </React.StrictMode>,
  )
  expect(revoked.has(live)).toBe(true)
  expect(
    revoked.has(screen.getByAltText('Test tablet').getAttribute('src')!),
  ).toBe(false)
  unmount()
  expect(revoked.size).toBe(next)
})

test('reusing a blob after clearing never exposes a previously revoked URL during render', () => {
  let next = 0
  const revoked = new Set<string>()
  const staleRenderUrls: string[] = []
  jest.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:${++next}`)
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    revoked.add(url)
  })
  function Preview({ image }: { image: Blob | null }) {
    const url = useObjectUrl(image)
    if (url && revoked.has(url)) staleRenderUrls.push(url)
    return <img src={url} alt="Reused tablet" />
  }
  const image = new Blob(['reusable image'])
  const { rerender } = render(<Preview image={image} />)
  rerender(<Preview image={null} />)
  rerender(<Preview image={image} />)
  expect(staleRenderUrls).toEqual([])
})

test('failed intermediate creation never resurrects the revoked URL of a reused blob', () => {
  let next = 0
  const revoked = new Set<string>()
  const staleRenderUrls: string[] = []
  const failingImage = new Blob(['fails'])
  jest.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    if (blob === failingImage) throw new Error('Allocation failed')
    return `blob:${++next}`
  })
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    revoked.add(url)
  })
  function Preview({ image }: { image: Blob }) {
    const url = useObjectUrl(image)
    if (url && revoked.has(url)) staleRenderUrls.push(url)
    return <img src={url} alt="Recovered tablet" />
  }
  const image = new Blob(['reusable image'])
  const { rerender } = render(<Preview image={image} />)
  rerender(<Preview image={failingImage} />)
  rerender(<Preview image={image} />)
  expect(staleRenderUrls).toEqual([])
})
