import React from 'react'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import {
  cacheScopeResolverOf,
  mockAuthService,
  renderInjectedApp,
  stubPrefetches,
} from 'injectedApp.testSupport'

jest.mock('./App', () => {
  return function MockApp() {
    return <div data-testid="app">App</div>
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
  const services: ReadonlyArray<
    [string, () => jest.MockedClass<never>, number]
  > = [
    [
      'BibliographyService',
      () => BibliographyService as unknown as jest.MockedClass<never>,
      1,
    ],
    ['TextService', () => TextService as unknown as jest.MockedClass<never>, 4],
    [
      'DossiersService',
      () => DossiersService as unknown as jest.MockedClass<never>,
      1,
    ],
  ]

  it.each(services)(
    '%s resolves the guest scope',
    (_name, getMockClass, argumentIndex) => {
      renderInjectedApp()

      expect(cacheScopeResolverOf(getMockClass(), argumentIndex)()).toBe(
        'guest',
      )
    },
  )

  it.each(services)(
    '%s follows the authenticated user',
    (_name, getMockClass, argumentIndex) => {
      ;(mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true)
      ;(mockAuthService.getUser as jest.Mock).mockReturnValue({
        sub: 'auth0|subject-a',
      })

      renderInjectedApp()

      expect(cacheScopeResolverOf(getMockClass(), argumentIndex)()).toBe(
        'authenticated:auth0|subject-a',
      )
    },
  )
})
