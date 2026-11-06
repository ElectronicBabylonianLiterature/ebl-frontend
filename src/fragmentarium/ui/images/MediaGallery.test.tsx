import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { saveAs } from 'file-saver'
import MediaGallery from 'fragmentarium/ui/images/MediaGallery'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  galleryServices,
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))
global.ResizeObserver = ResizeObserver
const fragment = fragmentFactory.build({ number: 'K.1' })

beforeEach(() => {
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gallery')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

test('selects primary photos, preserves attribution and downloads originals', async () => {
  const media = [
    mediaFixture({ id: 'copy', type: 'COPY', isPrimary: true }),
    mediaFixture({
      id: 'photo',
      isPrimary: true,
      caption: 'Obverse',
      attribution: 'Photographer credit',
    }),
  ]
  const services = galleryServices(media)
  render(<MediaGallery fragment={fragment} media={media} services={services} />)
  expect(await screen.findByAltText('Obverse')).toBeVisible()
  expect(screen.getByText('Photographer credit')).toBeVisible()
  expect(screen.getByText(/The Trustees/)).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Download' }))
  await waitFor(() =>
    expect(saveAs).toHaveBeenCalledWith(imageBlob, 'eBL-K.1-photo.jpeg'),
  )
  expect(services.binaryLoader.fetch).toHaveBeenCalledWith(
    { fragmentNumber: 'K.1', mediaId: 'photo', representation: 'original' },
    expect.any(AbortSignal),
  )
})

test('selects another image and releases previous object URLs', async () => {
  const media = [mediaFixture({ id: 'first' }), mediaFixture({ id: 'second' })]
  const services = galleryServices(media)
  render(<MediaGallery fragment={fragment} media={media} services={services} />)
  await screen.findByAltText('Fragment K.1')
  await userEvent.click(screen.getByRole('button', { name: 'Photo 2' }))
  expect(
    await screen.findByRole('button', { name: 'Photo 2' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await waitFor(() =>
    expect(services.binaryLoader.fetch).toHaveBeenCalledWith(
      { fragmentNumber: 'K.1', mediaId: 'second', representation: 'display' },
      expect.any(AbortSignal),
    ),
  )
  expect(URL.revokeObjectURL).toHaveBeenCalled()
})

test('loads a nonprimary original-only item without fetching thumbnails', async () => {
  const item = mediaFixture({
    representations: {
      original: { url: '/media/original', mimeType: 'image/png' },
      thumbnails: {},
    },
  })
  const services = galleryServices([item])
  render(
    <MediaGallery fragment={fragment} media={[item]} services={services} />,
  )
  expect(await screen.findByAltText('Fragment K.1')).toBeVisible()
  expect(services.binaryLoader.fetch).toHaveBeenCalledTimes(1)
  expect(services.binaryLoader.fetch).toHaveBeenCalledWith(
    { fragmentNumber: 'K.1', mediaId: item.id, representation: 'original' },
    expect.any(AbortSignal),
  )
})

test('paginates thumbnail requests without downloading all originals', async () => {
  const media = Array.from({ length: 14 }, (_, index) =>
    mediaFixture({ id: `image-${index}`, sortOrder: index }),
  )
  const services = galleryServices(media)
  render(<MediaGallery fragment={fragment} media={media} services={services} />)
  await screen.findByAltText('Fragment K.1')
  expect(
    screen.queryByRole('button', { name: 'Photo 13' }),
  ).not.toBeInTheDocument()
  expect(services.binaryLoader.fetch).toHaveBeenCalledTimes(13)
  await userEvent.click(screen.getByRole('button', { name: 'Next images' }))
  expect(await screen.findByRole('button', { name: 'Photo 13' })).toBeVisible()
  expect(screen.getByText('Page 2 of 2')).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Previous images' }))
  expect(await screen.findByRole('button', { name: 'Photo 1' })).toBeVisible()
  expect(
    services.binaryLoader.fetch.mock.calls.some(
      ([request]) => request.representation === 'original',
    ),
  ).toBe(false)
})

test('downloads a vector copy without rendering or opening it inline', async () => {
  const item = mediaFixture({
    type: 'COPY',
    representations: {
      original: { url: '/media/vector', mimeType: 'image/svg+xml' },
      thumbnails: {},
    },
  })
  const services = galleryServices([item])
  const vector = new Blob(['<svg/>'], { type: 'image/svg+xml' })
  services.binaryLoader.fetch.mockResolvedValue(vector)
  render(
    <MediaGallery fragment={fragment} media={[item]} services={services} />,
  )
  expect(screen.getByText(/No preview available/)).toBeVisible()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(services.binaryLoader.fetch).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Download original' }),
  )
  await waitFor(() =>
    expect(saveAs).toHaveBeenCalledWith(vector, `eBL-K.1-${item.id}.svg`),
  )
  expect(
    screen.queryByRole('button', { name: 'Open in New Tab' }),
  ).not.toBeInTheDocument()
})

test('renders an empty gallery without starting binary requests', () => {
  const services = galleryServices([])
  render(<MediaGallery fragment={fragment} media={[]} services={services} />)
  expect(services.binaryLoader.fetch).not.toHaveBeenCalled()
})
