import React, { ReactNode } from 'react'
import { render, RenderResult } from '@testing-library/react'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'
import { expectConsoleErrors } from 'setupTests'

export const fallbackMessage = "Something's gone wrong."

export function createErrorReportingService(): jest.Mocked<ErrorReporter> {
  return {
    captureException: jest.fn(),
    showReportDialog: jest.fn(),
    setUser: jest.fn(),
    clearScope: jest.fn(),
  }
}

export function escapeRegularExpression(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function boundaryCaughtErrorPattern(
  componentName: string,
  ...uncaughtErrorDescriptions: readonly string[]
): string {
  const uncaughtAlternatives = uncaughtErrorDescriptions
    .map(escapeRegularExpression)
    .join('|')
  return [
    `^Error: Uncaught \\[(${uncaughtAlternatives})\\]`,
    `^The above error occurred in the <${componentName}> component`,
  ].join('|')
}

export function expectBoundaryCaughtError(
  componentName: string,
  ...uncaughtErrorDescriptions: readonly string[]
): jest.SpyInstance {
  return expectConsoleErrors(
    new RegExp(
      boundaryCaughtErrorPattern(componentName, ...uncaughtErrorDescriptions),
    ),
  )
}

export function withinBoundary(
  errorReportingService: ErrorReporter,
  children: ReactNode,
): JSX.Element {
  return (
    <ErrorReporterContext.Provider value={errorReportingService}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ErrorReporterContext.Provider>
  )
}

export function renderInsideBoundary(
  errorReportingService: ErrorReporter,
  children: ReactNode,
): RenderResult {
  return render(withinBoundary(errorReportingService, children))
}
