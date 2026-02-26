import React from 'react'
import { render, screen } from '@testing-library/react'
import ResizeObserver from 'resize-observer-polyfill'
import Promise from 'bluebird'
import userEvent from '@testing-library/user-event'
import FolioImage from './FolioImage'
import Folio from 'fragmentarium/domain/Folio'

global.ResizeObserver = ResizeObserver
HTMLAnchorElement.prototype.click = jest.fn()

const folio = new Folio({ name: 'WGL', number: '00000' })
const objectUrl = 'object URL mock'
let fragmentService

beforeEach(() => {
  fragmentService = {
    findFolio: jest.fn(),
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValue(objectUrl)
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
})

it('Queries the API with given parameters', async () => {
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', async () => {
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
  expect(screen.getByRole('img')).toHaveAttribute('alt', folio.fileName)
})

it('Allows downloading the image', async () => {
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
  const downloadButton = screen.getByLabelText('Download')
  await userEvent.click(downloadButton)
  expect(URL.createObjectURL).toBeCalled()
})

it('Opens the image in a new tab', async () => {
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
  const openButton = screen.getByLabelText('Open in New Tab')
  window.open = jest.fn()
  await userEvent.click(openButton)
  expect(window.open).toBeCalledWith(objectUrl, '_blank')
})

describe('Zoom buttons', () => {
  it('handles zooming in', async () => {
    render(<FolioImage fragmentService={fragmentService} folio={folio} />)
    await screen.findByAltText(folio.fileName)
    const zoomInButton = screen.getByLabelText('Zoom In')

    await userEvent.click(zoomInButton)

    expect(screen.getByLabelText('Zoom In')).toBeInTheDocument()
  })
  it('handles zooming out', async () => {
    render(<FolioImage fragmentService={fragmentService} folio={folio} />)
    await screen.findByAltText(folio.fileName)
    const zoomOutButton = screen.getByLabelText('Zoom Out')

    await userEvent.click(zoomOutButton)

    expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument()
  })
  it('handles resetting the zoom', async () => {
    render(<FolioImage fragmentService={fragmentService} folio={folio} />)
    await screen.findByAltText(folio.fileName)
    const resetButton = screen.getByLabelText('Reset')

    await userEvent.click(resetButton)

    expect(screen.getByLabelText('Reset')).toBeInTheDocument()
  })
})
