import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageButtonGroup from './ImageButtonGroup'
import { act } from 'react-dom/test-utils'

const mockHandlers = {
  onZoomIn: jest.fn(),
  onZoomOut: jest.fn(),
  onReset: jest.fn(),
  onDownload: jest.fn(),
  onOpenInNewTab: jest.fn(),
}

describe('ImageButtonGroup interactions', () => {
  beforeEach(() => {
    render(<ImageButtonGroup imageActions={mockHandlers} />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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

describe('useImageActions hook', () => {
  const setupUseImageActions = (image, fileName) => {
    const link = document.createElement('a')
    return {
      handleDownload: () => {
        link.href = URL.createObjectURL(image)
        link.download = `eBL-${fileName}.${image.type.split('/')[1]}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
    }
  }

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('Extracts the correct file extension and appends it to the downloaded file', () => {
    const mockBlob = new Blob(['test content'], { type: 'image/png' })
    const fileName = 'test-image'

    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()

    const result = setupUseImageActions(mockBlob, fileName)

    expect(result.handleDownload).toBeDefined()
    act(() => {
      result.handleDownload()
    })

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
  })

  it('Handles different MIME types correctly', async () => {
    const testCases = [
      { type: 'image/jpeg' },
      { type: 'image/png' },
      { type: 'image/gif' },
      { type: 'image/webp' },
    ]

    for (const { type } of testCases) {
      const mockBlob = new Blob(['test content'], { type })
      const fileName = 'test-image'

      global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      const result = setupUseImageActions(mockBlob, fileName)

      await act(async () => {
        result.handleDownload()
      })

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    }
  })
})
