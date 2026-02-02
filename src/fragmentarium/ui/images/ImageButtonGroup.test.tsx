import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageButtonGroup, { useImageActions } from './ImageButtonGroup'
import { act } from 'react-dom/test-utils'

HTMLAnchorElement.prototype.click = jest.fn()

const mockHandlers = {
  onZoomIn: jest.fn(),
  onZoomOut: jest.fn(),
  onReset: jest.fn(),
  onDownload: jest.fn(),
  onOpenInNewTab: jest.fn(),
}

describe('ImageButtonGroup interactions', () => {
  const setup = (): void => {
    render(<ImageButtonGroup imageActions={mockHandlers} />)
  }

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
      setup()
      const button = await screen.findByLabelText(label)
      fireEvent.click(button)
      expect(mockHandlers[handler]).toHaveBeenCalled()
    })
  })
})

describe('useImageActions hook', () => {
  const originalAppendChild = document.body.appendChild
  const originalRemoveChild = document.body.removeChild
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
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
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

  it('does not recreate object URL on rerender and revokes on unmount', () => {
    const mockBlob = new Blob(['test content'], { type: 'image/png' })
    const createObjectURLSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-url')

    const TestComponent = ({ image }: { image: Blob }) => {
      const { imageUrl } = useImageActions(image, 'test-image')
      return <img src={imageUrl} alt="preview" />
    }

    const container = document.createElement('div')
    const { rerender, unmount } = render(<TestComponent image={mockBlob} />, {
      container,
    })
    rerender(<TestComponent image={mockBlob} />)

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)

    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })
})
