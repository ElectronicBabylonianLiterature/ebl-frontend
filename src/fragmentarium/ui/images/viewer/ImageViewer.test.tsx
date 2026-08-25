import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageViewer from 'fragmentarium/ui/images/viewer/ImageViewer'
import { ImageRendererProps } from 'fragmentarium/ui/images/viewer/imageViewerContract'

global.ResizeObserver = ResizeObserver
const image = new Blob([''], { type: 'image/png' })
const objectUrl = 'object URL mock'

beforeEach(() => {
  ;(URL.createObjectURL as jest.Mock).mockReturnValue(objectUrl)
})

const toolbarLabels = [
  'Zoom In',
  'Zoom Out',
  'Reset',
  'Download',
  'Open in New Tab',
]

test('renders the shared toolbar with the default renderer', async () => {
  render(<ImageViewer image={image} fileName="K.1" alt="Fragment K.1" />)
  await screen.findByRole('img')
  toolbarLabels.forEach((label) => {
    expect(screen.getByLabelText(label)).toBeInTheDocument()
  })
})

test('renders the image with the given alt text', async () => {
  render(<ImageViewer image={image} fileName="K.1" alt="Fragment K.1" />)
  expect(await screen.findByRole('img')).toHaveAttribute('alt', 'Fragment K.1')
})

test('renders an optional footer', async () => {
  render(
    <ImageViewer
      image={image}
      fileName="K.1"
      alt="Fragment K.1"
      footer={<footer>Copyright notice</footer>}
    />,
  )
  expect(await screen.findByText('Copyright notice')).toBeInTheDocument()
})

test('opens the image in a protected new tab', async () => {
  render(<ImageViewer image={image} fileName="K.1" alt="Fragment K.1" />)
  window.open = jest.fn()
  await userEvent.click(await screen.findByLabelText('Open in New Tab'))
  expect(window.open).toBeCalledWith(objectUrl, '_blank', 'noopener,noreferrer')
})

test('downloads with an allowlisted extension', async () => {
  const downloadNames: string[] = []
  HTMLAnchorElement.prototype.click = jest.fn(function (
    this: HTMLAnchorElement,
  ) {
    downloadNames.push(this.download)
  })
  render(<ImageViewer image={image} fileName="K.1" alt="Fragment K.1" />)
  await userEvent.click(await screen.findByLabelText('Download'))
  expect(downloadNames).toEqual(['eBL-K.1.png'])
})

describe('renderer contract', () => {
  function TestRenderer({
    imageUrl,
    alt,
    renderToolbar,
  }: ImageRendererProps): JSX.Element {
    return (
      <div>
        <span data-testid="url">{imageUrl}</span>
        {renderToolbar({
          zoomIn: jest.fn(),
          zoomOut: jest.fn(),
          reset: jest.fn(),
        })}
        <img src={imageUrl} alt={alt} />
      </div>
    )
  }

  test('delegates rendering to a supplied renderer', async () => {
    render(
      <ImageViewer
        image={image}
        fileName="K.1"
        alt="Fragment K.1"
        renderer={TestRenderer}
      />,
    )
    expect(await screen.findByTestId('url')).toHaveTextContent(objectUrl)
    expect(screen.getByLabelText('Download')).toBeInTheDocument()
  })
})
