import React, { useState } from 'react'
import { screen } from '@testing-library/react'
import { ConsoleErrorReporter, ErrorReporter } from 'ErrorReporterContext'
import { expectConsoleErrors } from 'setupTests'
import {
  createErrorReportingService,
  expectBoundaryCaughtError,
  fallbackMessage,
  boundaryCaughtErrorPattern,
  renderInsideBoundary,
} from 'common/errors/ErrorBoundary.comprehensive.testSupport'

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = createErrorReportingService()
  })

  describe('Error Reporter Integration', () => {
    test('captureException called with correct error object', () => {
      const testError = new Error('Test error for reporting')
      const CrashingComponent = () => {
        throw testError
      }
      expectBoundaryCaughtError(
        'CrashingComponent',
        'Error: Test error for reporting',
      )

      renderInsideBoundary(errorReportingService, <CrashingComponent />)

      expect(errorReportingService.captureException).toHaveBeenCalledTimes(1)
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        testError,
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      )
    })

    test('Error logged to console', () => {
      const consoleErrorSpy = expectConsoleErrors(
        new RegExp(
          [
            boundaryCaughtErrorPattern(
              'CrashingComponent',
              'Error: Console log test',
            ),
            '^captureException Error: Console log test',
          ].join('|'),
        ),
      )
      const CrashingComponent = () => {
        throw new Error('Console log test')
      }

      renderInsideBoundary(new ConsoleErrorReporter(), <CrashingComponent />)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'captureException',
        expect.objectContaining({ message: 'Console log test' }),
        expect.objectContaining({ componentStack: expect.any(String) }),
      )
      expect(
        consoleErrorSpy.mock.calls.some((call) =>
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
      expectBoundaryCaughtError('CrashingComponent', 'Error: Context test')

      renderInsideBoundary(errorReportingService, <CrashingComponent />)

      expect(errorReportingService.captureException).toHaveBeenCalled()
      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
      expectBoundaryCaughtError(
        'InfiniteLoopComponent',
        'Error: Render limit exceeded',
      )

      renderInsideBoundary(errorReportingService, <InfiniteLoopComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })

    test('Boundary does not enter error state if no error thrown', () => {
      const SafeComponent = () => <div>All good</div>

      renderInsideBoundary(errorReportingService, <SafeComponent />)

      expect(screen.getByText('All good')).toBeInTheDocument()
      expect(screen.queryByText(fallbackMessage)).not.toBeInTheDocument()
      expect(errorReportingService.captureException).not.toHaveBeenCalled()
    })

    test('Recovers from error when children change', () => {
      const CrashingComponent = () => {
        throw new Error('Initial error')
      }
      expectBoundaryCaughtError('CrashingComponent', 'Error: Initial error')

      renderInsideBoundary(errorReportingService, <CrashingComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()

      expect(errorReportingService.captureException).toHaveBeenCalled()
    })
  })
})
