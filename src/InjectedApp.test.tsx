import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Bluebird from 'bluebird'
import { AuthenticationContext } from 'auth/Auth'
import type { AuthenticationService } from 'auth/Auth'
import { guestSession } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import InjectedApp from './InjectedApp'
import type { ErrorReporter } from 'ErrorReporterContext'

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

const mockAuthService: AuthenticationService = {
  login: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockReturnValue(guestSession),
  isAuthenticated: jest.fn().mockReturnValue(false),
  getAccessToken: jest.fn(),
  getUser: jest.fn(),
}

const mockErrorReporter: ErrorReporter = {
  captureException: jest.fn(),
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

function renderInjectedApp() {
  return render(
    <AuthenticationContext.Provider value={mockAuthService}>
      <InjectedApp errorReporter={mockErrorReporter} />
    </AuthenticationContext.Provider>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  FragmentService.prototype.fetchProvenances = jest
    .fn()
    .mockReturnValue(Bluebird.resolve([]))
  FragmentService.prototype.fetchGenres = jest
    .fn()
    .mockReturnValue(Bluebird.resolve([]))
  TextService.prototype.list = jest.fn().mockReturnValue(Bluebird.resolve([]))
})

describe('InjectedApp', () => {
  test('renders App component', () => {
    renderInjectedApp()
    expect(screen.getByTestId('app')).toBeInTheDocument()
  })

  test('prefetches provenances on mount', async () => {
    renderInjectedApp()
    await waitFor(() => {
      expect(FragmentService.prototype.fetchProvenances).toHaveBeenCalled()
    })
  })

  test('prefetches text list on mount', async () => {
    renderInjectedApp()
    await waitFor(() => {
      expect(TextService.prototype.list).toHaveBeenCalled()
    })
  })

  test('prefetches genres on mount', async () => {
    renderInjectedApp()
    await waitFor(() => {
      expect(FragmentService.prototype.fetchGenres).toHaveBeenCalled()
    })
  })

  test('reports provenance prefetch error to errorReporter', async () => {
    const error = new Error('provenance error')
    FragmentService.prototype.fetchProvenances = jest
      .fn()
      .mockReturnValue(Bluebird.reject(error))

    renderInjectedApp()

    await waitFor(() => {
      expect(mockErrorReporter.captureException).toHaveBeenCalledWith(error)
    })
  })

  test('handles text list prefetch error gracefully', async () => {
    TextService.prototype.list = jest
      .fn()
      .mockReturnValue(Bluebird.reject(new Error('list error')))

    renderInjectedApp()

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument()
    })
  })

  test('handles genres prefetch error gracefully', async () => {
    FragmentService.prototype.fetchGenres = jest
      .fn()
      .mockReturnValue(Bluebird.reject(new Error('genres error')))

    renderInjectedApp()

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument()
    })
  })
})
