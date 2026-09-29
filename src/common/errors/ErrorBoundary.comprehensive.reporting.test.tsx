import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import ErrorReporterContext, {
  ConsoleErrorReporter,
  ErrorReporter,
} from 'ErrorReporterContext'
import {
  createErrorReportingServiceMock,
  renderExpectingReactError,
} from 'common/errors/ErrorBoundary.comprehensive.testSupport'
import { expectConsoleErrors } from 'setupTests'

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = createErrorReportingServiceMock()
  })

  describe('Error Reporter Integration', () => {
    test('captureException called with correct error object', () => {
      const testError = new Error('Test error for reporting')
      const CrashingComponent = () => {
        throw testError
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Test error for reporting',
      )

      expect(errorReportingService.captureException).toHaveBeenCalledTimes(1)
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        testError,
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      )
    })

    test('Error logged to console', () => {
      const consoleSpy = expectConsoleErrors(
        /^(captureException |Error: Uncaught \[|The above error occurred)/,
      )
      const CrashingComponent = () => {
        throw new Error('Console log test')
      }

      render(
        <ErrorReporterContext.Provider value={new ConsoleErrorReporter()}>
          <ErrorBoundary>
            <CrashingComponent />
          </ErrorBoundary>
        </ErrorReporterContext.Provider>,
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'captureException',
        expect.objectContaining({ message: 'Console log test' }),
        expect.objectContaining({ componentStack: expect.any(String) }),
      )
      expect(
        consoleSpy.mock.calls.some((call) =>
          call.some(
            (argument) =>
              argument instanceof Error &&
              argument.message === 'Console log test',
          ),
        ),
      ).toBe(true)
    })

    test('Error reporter context is used', () => {
      const CrashingComponent = () => {
        throw new Error('Context test')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Context test',
      )

      expect(errorReportingService.captureException).toHaveBeenCalled()
      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })
  })

  describe('"Never Hang" - Always Show UI', () => {
    test('Component with infinite loop detection', () => {
      let renderCount = 0
      const InfiniteLoopComponent = () => {
        renderCount++
        if (renderCount > 3) {
          throw new Error('Render limit exceeded')
        }
        const [, setState] = useState(0)
        setState(Math.random())
        return <div>Rendering</div>
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <InfiniteLoopComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Render limit exceeded',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })

    test('Boundary does not enter error state if no error thrown', () => {
      const SafeComponent = () => <div>All good</div>

      render(
        <ErrorReporterContext.Provider value={errorReportingService}>
          <ErrorBoundary>
            <SafeComponent />
          </ErrorBoundary>
        </ErrorReporterContext.Provider>,
      )

      expect(screen.getByText('All good')).toBeInTheDocument()
      expect(
        screen.queryByText("Something's gone wrong."),
      ).not.toBeInTheDocument()
      expect(errorReportingService.captureException).not.toHaveBeenCalled()
    })

    test('Recovers from error when children change', () => {
      const CrashingComponent = () => {
        throw new Error('Initial error')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Initial error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()

      expect(errorReportingService.captureException).toHaveBeenCalled()
    })
  })
})
