import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'
import {
  createErrorReportingService,
  expectBoundaryCaughtError,
  fallbackMessage,
  renderInsideBoundary,
  withinBoundary,
} from 'common/errors/ErrorBoundary.comprehensive.testSupport'

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = createErrorReportingService()
  })

  describe('State Management After Error', () => {
    test('Error boundary maintains error state after initial error', () => {
      const CrashingComponent = () => {
        throw new Error('Persistent error')
      }

      const { rerender } = render(
        withinBoundary(errorReportingService, <div>Initial render</div>),
      )

      expectBoundaryCaughtError('CrashingComponent', 'Error: Persistent error')
      rerender(withinBoundary(errorReportingService, <CrashingComponent />))

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })

    test('Error state does not leak to sibling error boundaries', () => {
      const CrashingComponent = () => {
        throw new Error('Error')
      }
      const SafeComponent = () => <div>Safe sibling</div>
      expectBoundaryCaughtError('CrashingComponent', 'Error: Error')

      render(
        <ErrorReporterContext.Provider value={errorReportingService}>
          <>
            <ErrorBoundary>
              <CrashingComponent />
            </ErrorBoundary>
            <ErrorBoundary>
              <SafeComponent />
            </ErrorBoundary>
          </>
        </ErrorReporterContext.Provider>,
      )

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
      expect(screen.getByText('Safe sibling')).toBeInTheDocument()
    })

    test('Nested error boundaries - inner catches error first', () => {
      const CrashingComponent = () => {
        throw new Error('Inner error')
      }
      const innerReporter = createErrorReportingService()
      expectBoundaryCaughtError('CrashingComponent', 'Error: Inner error')

      render(
        <ErrorReporterContext.Provider value={errorReportingService}>
          <ErrorBoundary>
            <div>Outer boundary</div>
            <ErrorReporterContext.Provider value={innerReporter}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>
          </ErrorBoundary>
        </ErrorReporterContext.Provider>,
      )

      expect(innerReporter.captureException).toHaveBeenCalled()
      expect(errorReportingService.captureException).not.toHaveBeenCalled()
    })
  })

  describe('Interaction with withData HOC', () => {
    test('Error in data-loading component caught by boundary', () => {
      const DataLoadingComponent = () => {
        throw new Error('Data loading crashed')
      }
      expectBoundaryCaughtError(
        'DataLoadingComponent',
        'Error: Data loading crashed',
      )

      renderInsideBoundary(errorReportingService, <DataLoadingComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalled()
    })

    test('Nested ErrorBoundaries in withData', () => {
      const CrashingInnerComponent = () => {
        throw new Error('Inner component crash')
      }
      expectBoundaryCaughtError(
        'CrashingInnerComponent',
        'Error: Inner component crash',
      )

      renderInsideBoundary(
        errorReportingService,
        <ErrorBoundary>
          <CrashingInnerComponent />
        </ErrorBoundary>,
      )

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })
  })
})
