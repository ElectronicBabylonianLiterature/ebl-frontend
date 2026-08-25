import React, { ReactNode } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { fireEvent, render, screen } from '@testing-library/react'
import { ViewerZoomControls } from 'fragmentarium/ui/images/viewer/imageViewerContract'
import StaticImageViewer, {
  maximumScale,
  minimumScale,
} from 'fragmentarium/ui/images/viewer/StaticImageViewer'

global.ResizeObserver = ResizeObserver

let capturedControls: ViewerZoomControls | undefined

function renderToolbar(controls: ViewerZoomControls): ReactNode {
  capturedControls = controls
  return <button>Toolbar</button>
}

function renderViewer(imageUrl: string | undefined): void {
  render(
    <StaticImageViewer
      imageUrl={imageUrl}
      alt="Fragment K.1"
      renderToolbar={renderToolbar}
    />,
  )
}

beforeEach(() => {
  capturedControls = undefined
})

test('renders the image and the toolbar', async () => {
  renderViewer('blob:image')
  const image = await screen.findByRole('img')
  expect(image).toHaveAttribute('src', 'blob:image')
  expect(image).toHaveAttribute('alt', 'Fragment K.1')
  expect(screen.getByRole('button', { name: 'Toolbar' })).toBeInTheDocument()
})

test('renders without a resolved image url', async () => {
  renderViewer(undefined)
  expect(await screen.findByRole('img')).not.toHaveAttribute('src')
})

test('exposes working zoom controls to the toolbar', async () => {
  renderViewer('blob:image')
  await screen.findByRole('img')
  expect(capturedControls).toBeDefined()
  expect(() => {
    capturedControls?.zoomIn()
    capturedControls?.zoomOut()
    capturedControls?.reset()
  }).not.toThrow()
})

test('preserves the established zoom limits', () => {
  expect(minimumScale).toBe(0.5)
  expect(maximumScale).toBe(8)
})

test('suppresses the default image click behaviour', async () => {
  renderViewer('blob:image')
  const image = await screen.findByRole('img')
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })
  fireEvent(image, clickEvent)
  expect(clickEvent.defaultPrevented).toBe(true)
})
