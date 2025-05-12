import React from 'react'
import { render, screen, act } from '@testing-library/react'
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

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn(),
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValue(objectUrl)
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  render(<FolioImage fragmentService={fragmentService} folio={folio} />)
  await screen.findByAltText(folio.fileName)
})

it('Queries the API with given parameters', () => {
  expect(fragmentService.findFolio).toBeCalledWith(folio)
})

it('Has the filename as alt text', () => {
  expect(screen.getByRole('img')).toHaveAttribute('alt', folio.fileName)
})

it('Allows downloading the image', async () => {
  const downloadButton = screen.getByLabelText('Download')
  await act(async () => {
    userEvent.click(downloadButton)
  })
  expect(URL.createObjectURL).toBeCalled()
})

it('Opens the image in a new tab', async () => {
  const openButton = screen.getByLabelText('Open in New Tab')
  window.open = jest.fn()
  await act(async () => {
    userEvent.click(openButton)
  })
  expect(window.open).toBeCalledWith(objectUrl, '_blank')
})

describe('Zoom buttons', () => {
  it('handles zooming in', async () => {
    const zoomInButton = screen.getByLabelText('Zoom In')

    await act(async () => {
      userEvent.click(zoomInButton)
    })

    expect(screen.getByLabelText('Zoom In')).toBeInTheDocument()
  })
  it('handles zooming out', async () => {
    const zoomOutButton = screen.getByLabelText('Zoom Out')

    await act(async () => {
      userEvent.click(zoomOutButton)
    })

    expect(screen.getByLabelText('Zoom Out')).toBeInTheDocument()
  })
  it('handles resetting the zoom', async () => {
    const resetButton = screen.getByLabelText('Reset')

    await act(async () => {
      userEvent.click(resetButton)
    })

    expect(screen.getByLabelText('Reset')).toBeInTheDocument()
  })
})
