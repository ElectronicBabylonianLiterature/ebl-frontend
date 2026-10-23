import React from 'react'
import { act, render, screen } from '@testing-library/react'
import MediaSummaryThumbnail from 'fragmentarium/ui/images/MediaSummaryThumbnail'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  galleryServices,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

beforeEach(() =>
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:summary'),
)

function fragmentWithPreview() {
  const media = mediaFixture()
  return fragmentFactory.build({
    number: 'K.1',
    hasPhoto: false,
    mediaSummary: {
      count: 1,
      types: ['PHOTO'],
      primary: {
        id: media.id,
        type: media.type,
        thumbnail: media.representations.thumbnails.small,
      },
    },
  })
}

test('loads summary previews with fragment-scoped credentials', async () => {
  const services = galleryServices()
  render(
    <MediaGalleryContext.Provider value={services}>
      <MediaSummaryThumbnail
        fragment={fragmentWithPreview()}
        fallback={<span>Legacy</span>}
      />
    </MediaGalleryContext.Provider>,
  )
  expect(await screen.findByAltText('Preview of K.1')).toHaveAttribute(
    'src',
    'blob:summary',
  )
  expect(screen.queryByText('Legacy')).not.toBeInTheDocument()
  expect(services.binaryLoader.fetch).toHaveBeenCalledWith(
    expect.objectContaining({ fragmentNumber: 'K.1', representation: 'small' }),
    expect.any(AbortSignal),
  )
})

test('keeps the legacy thumbnail when gallery integration is disabled', () => {
  render(
    <MediaSummaryThumbnail
      fragment={fragmentWithPreview()}
      fallback={<span>Legacy</span>}
    />,
  )
  expect(screen.getByText('Legacy')).toBeVisible()
})

test('ignores unscoped response URLs and keeps the legacy fallback', () => {
  const services = galleryServices()
  const fragment = fragmentWithPreview()
  const changed = fragmentFactory.build({
    ...fragment,
    mediaSummary: {
      count: 1,
      types: ['PHOTO'],
      primary: {
        id: 'other',
        type: 'PHOTO',
        thumbnail: { url: '/unrelated', mimeType: 'image/jpeg' },
      },
    },
  })
  render(
    <MediaGalleryContext.Provider value={services}>
      <MediaSummaryThumbnail
        fragment={changed}
        fallback={<span>Legacy</span>}
      />
    </MediaGalleryContext.Provider>,
  )
  expect(screen.getByText('Legacy')).toBeVisible()
  expect(services.binaryLoader.fetch).not.toHaveBeenCalled()
})

test('does not fall back after denied preview access', async () => {
  const services = galleryServices()
  services.binaryLoader.fetch.mockRejectedValue(new Error('Forbidden'))
  render(
    <MediaGalleryContext.Provider value={services}>
      <MediaSummaryThumbnail
        fragment={fragmentWithPreview()}
        fallback={<span>Legacy</span>}
        linked={false}
      />
    </MediaGalleryContext.Provider>,
  )
  await act(async () => undefined)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.queryByText('Legacy')).not.toBeInTheDocument()
})

test('rejects non-raster thumbnail bytes', async () => {
  const services = galleryServices()
  services.binaryLoader.fetch.mockResolvedValue(
    new Blob(['<svg/>'], { type: 'image/svg+xml' }),
  )
  render(
    <MediaGalleryContext.Provider value={services}>
      <MediaSummaryThumbnail fragment={fragmentWithPreview()} fallback={null} />
    </MediaGalleryContext.Provider>,
  )
  await act(async () => undefined)
  expect(URL.createObjectURL).not.toHaveBeenCalled()
})

test('discards a pending thumbnail after leaving the page', async () => {
  const services = galleryServices()
  let resolve: (image: Blob) => void = () => undefined
  services.binaryLoader.fetch.mockReturnValue(
    new Promise<Blob>((resolver) => {
      resolve = resolver
    }),
  )
  const { unmount } = render(
    <MediaGalleryContext.Provider value={services}>
      <MediaSummaryThumbnail fragment={fragmentWithPreview()} fallback={null} />
    </MediaGalleryContext.Provider>,
  )
  const signal = services.binaryLoader.fetch.mock.calls[0][1]
  unmount()
  expect(signal?.aborted).toBe(true)
  await act(async () => resolve(new Blob(['image'], { type: 'image/jpeg' })))
  expect(URL.createObjectURL).not.toHaveBeenCalled()
})
