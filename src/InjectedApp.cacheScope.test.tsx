import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InjectedApp from 'InjectedApp'
import { AuthenticationContext } from 'auth/Auth'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import {
  cacheScopeResolverOf,
  mockAuthService,
  mockErrorReporter,
  renderInjectedApp,
  stubPrefetches,
} from 'injectedApp.testSupport'

jest.mock('App', () => {
  const { useContext, useState } = jest.requireActual('react')
  const { MediaGalleryContext } = jest.requireActual(
    'fragmentarium/application/MediaGalleryContext',
  )
  return function MockApp() {
    const services = useContext(MediaGalleryContext)
    const [edits, setEdits] = useState(0)
    return (
      <div data-testid="app">
        <span data-testid="media-scope">{services?.sessionKey}</span>
        <button onClick={() => setEdits(edits + 1)}>Edits {edits}</button>
      </div>
    )
  }
})

jest.mock('http/ApiClient')
jest.mock('dictionary/infrastructure/WordRepository')
jest.mock('fragmentarium/infrastructure/FragmentRepository')
jest.mock('fragmentarium/infrastructure/ImageRepository')
jest.mock('bibliography/infrastructure/BibliographyRepository')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('signs/application/SignService')
jest.mock('signs/infrastructure/SignRepository')
jest.mock('afo-register/infrastructure/AfoRegisterRepository')
jest.mock('markup/application/MarkupService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/infrastructure/FindspotRepository')
jest.mock('dossiers/application/DossiersService')
jest.mock('dossiers/infrastructure/DossiersRepository')

beforeEach(stubPrefetches)

describe('every cache-scoped service resolves the same scope', () => {
  const services: ReadonlyArray<[string, object, number]> = [
    ['BibliographyService', BibliographyService, 1],
    ['TextService', TextService, 4],
    ['DossiersService', DossiersService, 1],
  ]

  it.each(services)(
    '%s resolves the guest scope',
    (_name, mockClass, argumentIndex) => {
      renderInjectedApp()

      expect(cacheScopeResolverOf(mockClass, argumentIndex)()).toBe('guest')
    },
  )

  it.each(services)(
    '%s follows the authenticated user',
    (_name, mockClass, argumentIndex) => {
      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getUser.mockReturnValue({
        sub: 'auth0|subject-a',
      })

      renderInjectedApp()

      expect(cacheScopeResolverOf(mockClass, argumentIndex)()).toBe(
        'authenticated:auth0|subject-a',
      )
    },
  )
})

afterEach(() => delete process.env.REACT_APP_MEDIA_GALLERY_ENABLED)

test.each(['known', 'missing', 'unavailable'] as const)(
  'clears gallery scope on logout with %s user metadata and preserves editing state',
  async (identity) => {
    process.env.REACT_APP_MEDIA_GALLERY_ENABLED = 'true'
    mockAuthService.isAuthenticated.mockReturnValue(true)
    mockAuthService.getUser.mockReturnValue(
      identity === 'known' ? { sub: 'auth0|subject-a' } : {},
    )
    if (identity === 'unavailable') {
      mockAuthService.getUser.mockImplementation(() => {
        throw new Error('User metadata unavailable')
      })
    }
    const { rerender } = renderInjectedApp()
    await userEvent.click(screen.getByRole('button', { name: 'Edits 0' }))
    const firstScope = screen.getByTestId('media-scope').textContent as string
    const application = (
      <AuthenticationContext.Provider value={mockAuthService}>
        <InjectedApp errorReporter={mockErrorReporter} />
      </AuthenticationContext.Provider>
    )
    rerender(application)
    expect(screen.getByTestId('media-scope')).toHaveTextContent(firstScope)
    mockAuthService.isAuthenticated.mockReturnValue(false)
    rerender(
      <AuthenticationContext.Provider value={mockAuthService}>
        <InjectedApp errorReporter={mockErrorReporter} />
      </AuthenticationContext.Provider>,
    )
    expect(screen.getByTestId('media-scope')).not.toHaveTextContent(firstScope)
    expect(screen.getByRole('button', { name: 'Edits 1' })).toBeVisible()
  },
)
