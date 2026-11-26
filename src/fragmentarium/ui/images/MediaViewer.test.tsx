import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaViewer from 'fragmentarium/ui/images/MediaViewer'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Museums } from 'fragmentarium/domain/museum'
import {
  galleryServices,
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

const mockGetData = jest.fn()
const mockGetTag = jest.fn()
jest.mock('exif-js', () => ({
  getData: (image: Blob, callback: (this: Blob) => void) =>
    mockGetData(image, callback),
  getTag: () => mockGetTag(),
}))
global.ResizeObserver = ResizeObserver

beforeEach(() =>
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:viewer'),
)

test('preserves original EXIF credits without requiring museum copyright', async () => {
  mockGetData.mockImplementation(
    (image: Blob, callback: (this: Blob) => void) => callback.call(image),
  )
  mockGetTag.mockReturnValue('Jane Doe')
  const media = mediaFixture({
    representations: {
      original: { url: '/original', mimeType: 'image/jpeg' },
      thumbnails: {},
    },
  })
  const fragment = fragmentFactory.build(
    {},
    {
      associations: {
        museum: { ...Museums.THE_BRITISH_MUSEUM, copyright: undefined },
      },
    },
  )
  const services = galleryServices([media])
  render(
    <MediaViewer
      fragment={fragment}
      media={media}
      binaryLoader={services.binaryLoader}
    />,
  )
  expect(await screen.findByText('Photograph by Jane Doe')).toBeVisible()
  expect(screen.queryByText(/The Trustees/)).not.toBeInTheDocument()
  expect(services.binaryLoader.fetch).toHaveBeenCalledTimes(1)
})

test('reports a pending original download and its failure', async () => {
  let reject: (error: Error) => void = () => undefined
  const loader = {
    fetch: jest
      .fn()
      .mockResolvedValueOnce(imageBlob)
      .mockReturnValueOnce(
        new Promise<Blob>((_resolve, rejectDownload) => {
          reject = rejectDownload
        }),
      ),
  }
  render(
    <MediaViewer
      fragment={fragmentFactory.build()}
      media={mediaFixture()}
      binaryLoader={loader}
    />,
  )
  await screen.findByRole('img')
  await userEvent.click(screen.getByRole('button', { name: 'Download' }))
  expect(screen.getByRole('status')).toHaveTextContent('Downloading original')
  await act(async () => reject(new Error('Download unavailable')))
  expect(await screen.findByText('Download unavailable')).toBeVisible()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
