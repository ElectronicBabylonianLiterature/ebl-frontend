import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageButtonGroup from './ImageButtonGroup'

const mockHandlers = {
  onZoomIn: jest.fn(),
  onZoomOut: jest.fn(),
  onReset: jest.fn(),
  onDownload: jest.fn(),
  onOpenInNewTab: jest.fn(),
}

beforeEach(() => {
  render(<ImageButtonGroup imageActions={mockHandlers} />)
})

describe('ImageButtonGroup interactions', () => {
  const buttonTests = [
    { label: 'Zoom In', handler: 'onZoomIn' },
    { label: 'Zoom Out', handler: 'onZoomOut' },
    { label: 'Reset', handler: 'onReset' },
    { label: 'Download', handler: 'onDownload' },
    { label: 'Open in New Tab', handler: 'onOpenInNewTab' },
  ]

  buttonTests.forEach(({ label, handler }) => {
    it(`Handles ${label} button click`, async () => {
      const button = await screen.findByLabelText(label)
      fireEvent.click(button)
      expect(mockHandlers[handler]).toHaveBeenCalled()
    })
  })
})
