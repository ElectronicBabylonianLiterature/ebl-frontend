import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import MediaThumbnail from 'fragmentarium/ui/images/MediaThumbnail'
import {
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

beforeEach(() => {
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:thumbnail')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

test('uses an available larger thumbnail without fetching an original', async () => {
  const base = mediaFixture()
  const media = mediaFixture({
    representations: {
      ...base.representations,
      thumbnails: { medium: base.representations.thumbnails.small },
    },
  })
  const loader = { fetch: jest.fn().mockResolvedValue(imageBlob) }
  render(
    <MediaThumbnail fragmentNumber="K.1" media={media} binaryLoader={loader} />,
  )
  await waitFor(() =>
    expect(screen.getByAltText('')).toHaveAttribute('src', 'blob:thumbnail'),
  )
  expect(loader.fetch).toHaveBeenCalledWith(
    expect.objectContaining({ representation: 'medium' }),
    expect.any(AbortSignal),
  )
})

test.each([
  new Error('Missing thumbnail'),
  new DOMException('cancelled', 'AbortError'),
])('leaves a text-only selector after unavailable thumbnail', async (error) => {
  const loader = { fetch: jest.fn().mockRejectedValue(error) }
  const { container } = render(
    <MediaThumbnail
      fragmentNumber="K.1"
      media={mediaFixture()}
      binaryLoader={loader}
    />,
  )
  await act(async () => undefined)
  expect(container).toBeEmptyDOMElement()
})

test('never creates an image URL for a non-raster response', async () => {
  const loader = {
    fetch: jest
      .fn()
      .mockResolvedValue(new Blob(['<svg/>'], { type: 'image/svg+xml' })),
  }
  render(
    <MediaThumbnail
      fragmentNumber="K.1"
      media={mediaFixture()}
      binaryLoader={loader}
    />,
  )
  await act(async () => undefined)
  expect(URL.createObjectURL).not.toHaveBeenCalled()
})

test('ignores a stale thumbnail response after unmount', async () => {
  let resolve: (blob: Blob) => void = () => undefined
  const loader = {
    fetch: jest.fn().mockImplementation(
      () =>
        new Promise<Blob>((resolver) => {
          resolve = resolver
        }),
    ),
  }
  const { unmount } = render(
    <MediaThumbnail
      fragmentNumber="K.1"
      media={mediaFixture()}
      binaryLoader={loader}
    />,
  )
  unmount()
  await act(async () => resolve(imageBlob))
  expect(loader.fetch.mock.calls[0][1].aborted).toBe(true)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})
