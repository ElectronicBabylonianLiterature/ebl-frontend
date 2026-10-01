import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen } from '@testing-library/react'
import Photo from 'fragmentarium/ui/images/Photo'
import { fireEvent } from '@testing-library/react'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Museums } from 'fragmentarium/domain/museum'

const mockGetData = jest.fn<void, [Blob, (this: unknown) => void]>()
const mockGetTag = jest.fn<string, [unknown, string]>()

jest.mock('exif-js', () => ({
  getData: (image: Blob, onRead: (this: unknown) => void) =>
    mockGetData(image, onRead),
  getTag: (image: unknown, tag: string) => mockGetTag(image, tag),
}))

const number = 'K 1'
const blob = new Blob([''], { type: 'image/jpeg' })
const objectUrl = 'object URL mock'

global.ResizeObserver = ResizeObserver

const setup = (): void => {
  const fragment = fragmentFactory.build({ number })
  jest.spyOn(URL, 'createObjectURL').mockReturnValueOnce(objectUrl)
  render(<Photo photo={blob} fragment={fragment} />)
}

it('Has alt text', async () => {
  setup()
  expect(await screen.findByRole('img')).toHaveAttribute(
    'alt',
    `Fragment ${number}`,
  )
})

it('Keeps the existing photo action toolbar', async () => {
  setup()
  expect(
    await screen.findByRole('button', { name: 'Open in New Tab' }),
  ).toBeInTheDocument()
})

it('Has a link to the copyright page', async () => {
  setup()
  const link = await screen.findByRole('link', {
    name: /The Trustees of the British Museum/i,
  })
  expect(link).toHaveAttribute(
    'href',
    'https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx',
  )
})

it('Has copyright', async () => {
  setup()
  expect(await screen.findByText(/The Trustees/)).toHaveTextContent(
    'The Trustees of the British Museum',
  )
})

it('Keeps a click on the photo from following it', async () => {
  setup()

  expect(fireEvent.click(await screen.findByRole('img'))).toBe(false)
})

it('Credits the photographer from the EXIF data', async () => {
  mockGetData.mockImplementation((image, onRead) => onRead.call(image))
  mockGetTag.mockReturnValue('Jane Doe')

  setup()

  expect(await screen.findByText(/Photograph by Jane Doe/)).toBeInTheDocument()
  expect(mockGetTag).toHaveBeenCalledWith(blob, 'Artist')
})

it('Leaves out the copyright notice when the museum has none', async () => {
  const museum = { ...Museums.THE_BRITISH_MUSEUM, copyright: undefined }
  render(
    <Photo
      photo={blob}
      fragment={fragmentFactory.build({ number }, { associations: { museum } })}
    />,
  )

  expect(await screen.findByRole('img')).toBeInTheDocument()
  expect(screen.queryByText(/The Trustees/)).not.toBeInTheDocument()
})
