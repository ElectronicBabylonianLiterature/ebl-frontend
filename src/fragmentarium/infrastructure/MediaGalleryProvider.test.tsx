import React, { useContext, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MediaGalleryProvider } from 'fragmentarium/infrastructure/MediaGalleryProvider'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import { AuthenticationContext, AuthenticationService } from 'auth/Auth'
import MemorySession from 'auth/Session'

const originalMediaGalleryEnabled = process.env.REACT_APP_MEDIA_GALLERY_ENABLED
const originalMediaUploadEnabled = process.env.REACT_APP_MEDIA_UPLOAD_ENABLED

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

beforeEach(() => {
  delete process.env.REACT_APP_MEDIA_GALLERY_ENABLED
  delete process.env.REACT_APP_MEDIA_UPLOAD_ENABLED
})

afterEach(() => {
  if (originalMediaUploadEnabled === undefined)
    delete process.env.REACT_APP_MEDIA_UPLOAD_ENABLED
  else process.env.REACT_APP_MEDIA_UPLOAD_ENABLED = originalMediaUploadEnabled
  if (originalMediaGalleryEnabled === undefined) {
    delete process.env.REACT_APP_MEDIA_GALLERY_ENABLED
  } else {
    process.env.REACT_APP_MEDIA_GALLERY_ENABLED = originalMediaGalleryEnabled
  }
})

function Capabilities(): JSX.Element {
  const services = useContext(MediaGalleryContext)
  return (
    <span>{`upload:${!!services?.canUpload};manage:${!!services?.canManage};writer:${!!services?.management}`}</span>
  )
}

test.each([
  [[], false, false],
  [['read:fragments', 'transliterate:fragments'], false, false],
  [['upload:fragment_media'], true, false],
  [['manage:fragment_media'], true, true],
])('write UI requires dedicated scopes %p', (scopes, upload, manage) => {
  process.env.REACT_APP_MEDIA_GALLERY_ENABLED = 'true'
  process.env.REACT_APP_MEDIA_UPLOAD_ENABLED = 'true'
  const auth: AuthenticationService = {
    login: jest.fn(),
    logout: jest.fn(),
    getSession: () => new MemorySession(scopes),
    isAuthenticated: () => true,
    getUser: () => ({ sub: 'auth0|user' }),
    getAccessToken: jest.fn(),
  }
  render(
    <AuthenticationContext.Provider value={auth}>
      <MediaGalleryProvider
        apiClient={{
          ...apiClient,
          requestJson: jest.fn(),
          uploadBinary: jest.fn(),
        }}
        scope="user"
      >
        <Capabilities />
      </MediaGalleryProvider>
    </AuthenticationContext.Provider>,
  )
  expect(
    screen.getByText(`upload:${upload};manage:${manage};writer:${upload}`),
  ).toBeVisible()
})

test('upload flag defaults off independently of enabled gallery and permissions', () => {
  process.env.REACT_APP_MEDIA_GALLERY_ENABLED = 'true'
  const auth: AuthenticationService = {
    login: jest.fn(),
    logout: jest.fn(),
    getSession: () => new MemorySession(['manage:fragment_media']),
    isAuthenticated: () => true,
    getUser: () => ({ sub: 'auth0|user' }),
    getAccessToken: jest.fn(),
  }
  render(
    <AuthenticationContext.Provider value={auth}>
      <MediaGalleryProvider
        apiClient={{
          ...apiClient,
          requestJson: jest.fn(),
          uploadBinary: jest.fn(),
        }}
        scope="user"
      >
        <Capabilities />
      </MediaGalleryProvider>
    </AuthenticationContext.Provider>,
  )
  expect(
    screen.getByText('upload:false;manage:false;writer:false'),
  ).toBeVisible()
})

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
