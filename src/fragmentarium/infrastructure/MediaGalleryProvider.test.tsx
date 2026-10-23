import React, { useContext, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MediaGalleryProvider } from 'fragmentarium/infrastructure/MediaGalleryProvider'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'

const apiClient = {
  fetchJson: jest.fn(),
  fetchBlob: jest.fn(),
  postJson: jest.fn(),
}

function Child(): JSX.Element {
  const services = useContext(MediaGalleryContext)
  const [count, setCount] = useState(0)
  return (
    <>
      <span data-testid="scope">{services?.sessionKey ?? 'disabled'}</span>
      <button onClick={() => setCount(count + 1)}>Edits {count}</button>
    </>
  )
}

afterEach(() => delete process.env.REACT_APP_MEDIA_GALLERY_ENABLED)

test('defaults to disabled and preserves application state on provider rerenders', async () => {
  const element = (scope: string): JSX.Element => (
    <MediaGalleryProvider apiClient={apiClient} scope={scope}>
      <Child />
    </MediaGalleryProvider>
  )
  const { rerender } = render(element('guest'))
  expect(screen.getByTestId('scope')).toHaveTextContent('disabled')
  await userEvent.click(screen.getByRole('button', { name: 'Edits 0' }))
  rerender(element('authenticated'))
  expect(screen.getByRole('button', { name: 'Edits 1' })).toBeVisible()
})

test('keeps a stable gallery scope until identity or API client changes', () => {
  process.env.REACT_APP_MEDIA_GALLERY_ENABLED = 'true'
  const element = (scope: string): JSX.Element => (
    <MediaGalleryProvider apiClient={apiClient} scope={scope}>
      <Child />
    </MediaGalleryProvider>
  )
  const { rerender } = render(element('user-a'))
  const first = screen.getByTestId('scope').textContent
  rerender(element('user-a'))
  expect(screen.getByTestId('scope')).toHaveTextContent(first as string)
  rerender(element('user-b'))
  expect(screen.getByTestId('scope')).not.toHaveTextContent(first as string)
})
