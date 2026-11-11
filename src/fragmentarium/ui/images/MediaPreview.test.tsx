import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaPreview from 'fragmentarium/ui/images/MediaPreview'
import { imageBlob } from 'fragmentarium/ui/images/gallery.testSupport'

const mockGetData = jest.fn()
jest.mock('exif-js', () => ({
  getData: (image: Blob, callback: () => void) => mockGetData(image, callback),
  getTag: jest.fn(),
}))
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
  expect(mockGetData).toHaveBeenCalledWith(imageBlob, expect.any(Function))
})

test.each([
  ['display', undefined],
  ['original', 'Credited photographer'],
] as const)(
  'does not read EXIF credits for %s previews with attribution %p',
  async (representation, attribution) => {
    const loader = { fetch: jest.fn().mockResolvedValue(imageBlob) }
    render(
      <MediaPreview
        fragmentNumber="K.1"
        mediaId="id"
        representation={representation}
        binaryLoader={loader}
        description="Photo"
        onDownload={jest.fn()}
        attribution={attribution}
      />,
    )
    expect(await screen.findByAltText('Photo')).toBeVisible()
    expect(mockGetData).not.toHaveBeenCalled()
  },
)
