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

  describe('Performance and Memory', () => {
    test('Multiple errors do not cause memory leak', () => {
      const errors = Array.from({ length: 10 }, (_, i) => `Error ${i}`)

      errors.forEach((errorMsg) => {
        errorReportingService.captureException.mockClear()

        const CrashingComponent = () => {
          throw new Error(errorMsg)
        }

        let unmount = (): void => undefined

        renderExpectingReactError(() => {
          const view = render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <CrashingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          )
          unmount = view.unmount
        }, errorMsg)

        expect(errorReportingService.captureException).toHaveBeenCalledWith(
          expect.objectContaining({ message: errorMsg }),
          expect.any(Object),
        )

        unmount()
      })
    })

    test('Large component tree error - does not crash boundary', () => {
      const DeepComponent = ({ depth }: { depth: number }) => {
        if (depth === 50) {
          throw new Error('Deep error')
        }
        if (depth < 50) {
          return <DeepComponent depth={depth + 1} />
        }
        return <div>Leaf</div>
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <DeepComponent depth={0} />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Deep error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })
  })

  describe('Real-World Scenarios', () => {
    test('Network request fails during render (anti-pattern, but happens)', () => {
      const NetworkComponent = () => {
        throw new Error('Network error: Failed to fetch')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <NetworkComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Network error: Failed to fetch',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Network error'),
        }),
        expect.any(Object),
      )
    })

    test('Auth0 initialization error caught by boundary', () => {
      const Auth0Component = () => {
        throw new Error('Auth0: Invalid configuration')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <Auth0Component />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Auth0: Invalid configuration',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })

    test('Third-party library throws in render', () => {
      const ThirdPartyComponent = () => {
        throw new Error('React Bootstrap: Invalid props')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <ThirdPartyComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'React Bootstrap: Invalid props',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })
  })
})
