import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'
import {
  createErrorReportingServiceMock,
  renderExpectingReactError,
} from 'common/errors/ErrorBoundary.comprehensive.testSupport'

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = createErrorReportingServiceMock()
  })

  describe('Error Types and Messages', () => {
    test('TypeError in component', () => {
      const TypeErrorComponent = () => {
        const obj = null as unknown as { property: string }
        return <div>{obj.property}</div>
      }

      renderExpectingReactError(() =>
        render(
          <ErrorReporterContext.Provider value={errorReportingService}>
            <ErrorBoundary>
              <TypeErrorComponent />
            </ErrorBoundary>
          </ErrorReporterContext.Provider>,
        ),
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TypeError' }),
        expect.any(Object),
      )
    })

    test('ReferenceError in component', () => {
      const ReferenceErrorComponent = () => {
        // @ts-expect-error Intentional error for testing
        return <div>{undefinedVariable}</div>
      }

      renderExpectingReactError(() =>
        render(
          <ErrorReporterContext.Provider value={errorReportingService}>
            <ErrorBoundary>
              <ReferenceErrorComponent />
            </ErrorBoundary>
          </ErrorReporterContext.Provider>,
        ),
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'ReferenceError' }),
        expect.any(Object),
      )
    })

    test('Custom Error class thrown', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const CustomErrorComponent = () => {
        throw new CustomError('Custom error message')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CustomErrorComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Custom error message',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'CustomError',
          message: 'Custom error message',
        }),
        expect.any(Object),
      )
    })

    test('Error with very long message', () => {
      const longMessage = 'Error: '.repeat(1000)
      const LongMessageComponent = () => {
        throw new Error(longMessage)
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <LongMessageComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        longMessage,
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: longMessage }),
        expect.any(Object),
      )
    })
  })

  describe('State Management After Error', () => {
    test('Error boundary maintains error state after initial error', () => {
      const CrashingComponent = () => {
        throw new Error('Persistent error')
      }

      const { rerender } = render(
        <ErrorReporterContext.Provider value={errorReportingService}>
          <ErrorBoundary>
            <div>Initial render</div>
          </ErrorBoundary>
        </ErrorReporterContext.Provider>,
      )

      renderExpectingReactError(
        () =>
          rerender(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Persistent error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })

    test('Error state does not leak to sibling error boundaries', () => {
      const CrashingComponent = () => {
        throw new Error('Error')
      }
      const SafeComponent = () => <div>Safe sibling</div>

      renderExpectingReactError(
        () =>
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
          ),
        'Error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(screen.getByText('Safe sibling')).toBeInTheDocument()
    })

    test('Nested error boundaries - inner catches error first', () => {
      const CrashingComponent = () => {
        throw new Error('Inner error')
      }

      const innerReporter = {
        captureException: jest.fn(),
        showReportDialog: jest.fn(),
        setUser: jest.fn(),
        clearScope: jest.fn(),
      }

      renderExpectingReactError(
        () =>
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
          ),
        'Inner error',
      )

      expect(innerReporter.captureException).toHaveBeenCalled()
      expect(errorReportingService.captureException).not.toHaveBeenCalled()
    })
  })
})
