import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PhotoButtonGroup from './PhotoButtonGroup'

const mockOnZoomIn = jest.fn()
const mockOnZoomOut = jest.fn()
const mockOnReset = jest.fn()
const mockOnDownload = jest.fn()
const mockOnOpenInNewTab = jest.fn()

beforeEach(() => {
  render(
    <PhotoButtonGroup
      onZoomIn={mockOnZoomIn}
      onZoomOut={mockOnZoomOut}
      onReset={mockOnReset}
      onDownload={mockOnDownload}
      onOpenInNewTab={mockOnOpenInNewTab}
    />
  )
})

it('Handles zoom in button click', async () => {
  const zoomInButton = await screen.findByLabelText('Zoom In')
  fireEvent.click(zoomInButton)
  expect(mockOnZoomIn).toHaveBeenCalled()
})

it('Handles zoom out button click', async () => {
  const zoomOutButton = await screen.findByLabelText('Zoom Out')
  fireEvent.click(zoomOutButton)
  expect(mockOnZoomOut).toHaveBeenCalled()
})

it('Handles reset button click', async () => {
  const resetButton = await screen.findByLabelText('Reset')
  fireEvent.click(resetButton)
  expect(mockOnReset).toHaveBeenCalled()
})

it('Handles download button click', async () => {
  const downloadButton = await screen.findByLabelText('Download')
  fireEvent.click(downloadButton)
  expect(mockOnDownload).toHaveBeenCalled()
})

it('Handles open in new tab button click', async () => {
  const openInNewTabButton = await screen.findByLabelText('Open in New Tab')
  fireEvent.click(openInNewTabButton)
  expect(mockOnOpenInNewTab).toHaveBeenCalled()
})
