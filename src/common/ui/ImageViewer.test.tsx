import React, { act } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ImageViewer from './ImageViewer'

const mockZoomIn = jest.fn()
const mockZoomOut = jest.fn()
const mockResetTransform = jest.fn()

type MockTransformControls = {
  readonly zoomIn: jest.Mock
  readonly zoomOut: jest.Mock
  readonly resetTransform: jest.Mock
}

type MockTransformWrapperProps = {
  readonly children: (controls: MockTransformControls) => React.ReactNode
}

type MockTransformComponentProps = {
  readonly children: React.ReactNode
  readonly wrapperClass?: string
  readonly contentClass?: string
}

jest.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({ children }: MockTransformWrapperProps) => (
    <div>
      {children({
        zoomIn: mockZoomIn,
        zoomOut: mockZoomOut,
        resetTransform: mockResetTransform,
      })}
    </div>
  ),
  TransformComponent: ({
    children,
    wrapperClass,
    contentClass,
  }: MockTransformComponentProps) => (
    <div className={wrapperClass}>
      <div className={contentClass}>{children}</div>
    </div>
  ),
}))

const image = new Blob(['image data'], { type: 'image/jpeg' })
const objectUrl = 'blob:viewer-url'

function renderViewer(): ReturnType<typeof render> {
  ;(URL.createObjectURL as jest.Mock).mockReturnValue(objectUrl)
  return render(
    <ImageViewer image={image} alt="Fragment K 1" downloadFileName="K 1" />,
  )
}

describe('ImageViewer', () => {
  const originalCreateElement = document.createElement.bind(document)
  const originalWindowOpen = window.open
  const originalClick = HTMLAnchorElement.prototype.click

  beforeEach(() => {
    HTMLAnchorElement.prototype.click = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    document.createElement = originalCreateElement
    window.open = originalWindowOpen
    HTMLAnchorElement.prototype.click = originalClick
  })

  it('renders the object URL image with accessible controls', () => {
    renderViewer()

    expect(screen.getByRole('img', { name: 'Fragment K 1' })).toHaveAttribute(
      'src',
      objectUrl,
    )
    expect(
      screen.getByRole('toolbar', { name: 'Image controls' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom level')).toHaveTextContent('100%')
  })

  it('connects zoom controls to animated transform actions', () => {
    renderViewer()

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset image' }))

    expect(mockZoomIn).toHaveBeenCalledWith(0.5, 180, 'easeOut')
    expect(mockZoomOut).toHaveBeenCalledWith(0.5, 180, 'easeOut')
    expect(mockResetTransform).toHaveBeenCalledWith(180, 'easeOut')
  })

  it('downloads the current Blob URL with the existing eBL filename format', () => {
    const createdLinks: HTMLAnchorElement[] = []
    document.createElement = jest.fn((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        createdLinks.push(element as HTMLAnchorElement)
      }
      return element
    }) as typeof document.createElement

    renderViewer()
    fireEvent.click(screen.getByRole('button', { name: 'Download image' }))

    expect(createdLinks[0]).toHaveAttribute('download', 'eBL-K 1.jpeg')
    expect(createdLinks[0]).toHaveAttribute('href', objectUrl)
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('opens the original Blob in a new tab and revokes that URL later', () => {
    jest.useFakeTimers()
    ;(URL.createObjectURL as jest.Mock)
      .mockReturnValueOnce(objectUrl)
      .mockReturnValueOnce('blob:original-url')
    window.open = jest.fn(() => ({ opener: window }) as Window)

    render(
      <ImageViewer image={image} alt="Fragment K 1" downloadFileName="K 1" />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open original image' }))

    expect(window.open).toHaveBeenCalledWith(
      'blob:original-url',
      '_blank',
      'noopener,noreferrer',
    )

    act(() => {
      jest.advanceTimersByTime(60000)
    })

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:original-url')
  })

  it('revokes the displayed object URL on unmount', () => {
    const { unmount } = renderViewer()

    unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(objectUrl)
  })
})
