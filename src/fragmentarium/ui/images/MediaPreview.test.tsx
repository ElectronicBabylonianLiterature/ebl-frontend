import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaPreview from 'fragmentarium/ui/images/MediaPreview'
import { imageBlob } from 'fragmentarium/ui/images/gallery.testSupport'

global.ResizeObserver = ResizeObserver

beforeEach(() =>
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview'),
)

test('blocks an unsafe raster preview response and permits retry', async () => {
  const loader = {
    fetch: jest
      .fn()
      .mockResolvedValueOnce(new Blob(['<svg/>'], { type: 'image/svg+xml' }))
      .mockResolvedValueOnce(imageBlob),
  }
  render(
    <MediaPreview
      fragmentNumber="K.1"
      mediaId="id"
      representation="original"
      binaryLoader={loader}
      description="Photo"
      onDownload={jest.fn()}
    />,
  )
  expect(
    await screen.findByText('This image cannot be displayed safely.'),
  ).toBeVisible()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByAltText('Photo')).toBeVisible()
})
