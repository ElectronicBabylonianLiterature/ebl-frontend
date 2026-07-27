import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import Bluebird from 'bluebird'
import { AuthenticationContext } from 'auth/Auth'
import type { AuthenticationService } from 'auth/Auth'
import { guestSession } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import InjectedApp from 'InjectedApp'
import type { ErrorReporter } from 'ErrorReporterContext'

export const mockAuthService: AuthenticationService = {
  login: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockReturnValue(guestSession),
  isAuthenticated: jest.fn().mockReturnValue(false),
  getAccessToken: jest.fn(),
  getUser: jest.fn(),
}

export const mockErrorReporter: ErrorReporter = {
  captureException: jest.fn(),
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

export function renderInjectedApp(): RenderResult {
  return render(
    <AuthenticationContext.Provider value={mockAuthService}>
      <InjectedApp errorReporter={mockErrorReporter} />
    </AuthenticationContext.Provider>,
  )
}

export function cacheScopeResolverOf(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockClass: jest.MockedClass<any>,
  argumentIndex: number,
): () => string {
  const calls = mockClass.mock.calls
  const resolver = calls[calls.length - 1][argumentIndex]
  expect(resolver).toBeDefined()
  return resolver as () => string
}

export function stubPrefetches(): void {
  jest.clearAllMocks()
  ;(mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false)
  ;(mockAuthService.getUser as jest.Mock).mockReturnValue({})
  FragmentService.prototype.fetchProvenances = jest
    .fn()
    .mockReturnValue(Bluebird.resolve([]))
  FragmentService.prototype.fetchGenres = jest
    .fn()
    .mockReturnValue(Bluebird.resolve([]))
  TextService.prototype.list = jest.fn().mockReturnValue(Bluebird.resolve([]))
}
