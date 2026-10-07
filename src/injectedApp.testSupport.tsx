import _ from 'lodash'
import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { AuthenticationContext } from 'auth/Auth'
import type { AuthenticationService } from 'auth/Auth'
import { guestSession } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import InjectedApp from 'InjectedApp'
import type { ErrorReporter } from 'ErrorReporterContext'

export const mockAuthService: jest.Mocked<AuthenticationService> = {
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
  mockClass: object,
  argumentIndex: number,
): () => string {
  const [constructorCalls] = [mockClass]
    .filter(jest.isMockFunction)
    .map((mockedClass) => mockedClass.mock.calls)
  expect(constructorCalls).toBeDefined()
  const resolver: () => string = _.last(constructorCalls)[argumentIndex]
  expect(resolver).toEqual(expect.any(Function))
  return resolver
}

export function stubPrefetches(): void {
  jest.clearAllMocks()
  mockAuthService.isAuthenticated.mockReturnValue(false)
  mockAuthService.getUser.mockReturnValue({})
  FragmentService.prototype.fetchProvenances = jest
    .fn()
    .mockReturnValue(Promise.resolve([]))
  FragmentService.prototype.fetchGenres = jest
    .fn()
    .mockReturnValue(Promise.resolve([]))
  TextService.prototype.list = jest.fn().mockReturnValue(Promise.resolve([]))
}
