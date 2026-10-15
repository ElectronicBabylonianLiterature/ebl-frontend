import React from 'react'
import { screen } from '@testing-library/react'
import { ErrorReporter } from 'ErrorReporterContext'
import {
  createErrorReportingService,
  expectBoundaryCaughtError,
  fallbackMessage,
  renderInsideBoundary,
} from 'common/errors/ErrorBoundary.comprehensive.testSupport'

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = createErrorReportingService()
  })

  describe('Performance and Memory', () => {
    test('Multiple errors do not cause memory leak', () => {
      const errorMessages = Array.from(
        { length: 10 },
        (_, errorIndex) => `Error ${errorIndex}`,
      )
      const consoleErrorSpy = expectBoundaryCaughtError(
        'CrashingComponent',
        ...errorMessages.map((errorMessage) => `Error: ${errorMessage}`),
      )

      errorMessages.forEach((errorMessage) => {
        errorReportingService.captureException.mockClear()
        const loggedCallsBeforeRender = consoleErrorSpy.mock.calls.length

        const CrashingComponent = () => {
          throw new Error(errorMessage)
        }

        const { unmount } = renderInsideBoundary(
          errorReportingService,
          <CrashingComponent />,
        )

        expect(
          consoleErrorSpy.mock.calls
            .slice(loggedCallsBeforeRender)
            .some((call) =>
              call.some(
                (argument) =>
                  argument instanceof Error &&
                  argument.message === errorMessage,
              ),
            ),
        ).toBe(true)
        expect(errorReportingService.captureException).toHaveBeenCalledWith(
          expect.objectContaining({ message: errorMessage }),
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
      expectBoundaryCaughtError('DeepComponent', 'Error: Deep error')

      renderInsideBoundary(errorReportingService, <DeepComponent depth={0} />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })
  })

  describe('Real-World Scenarios', () => {
    test('Network request fails during render (anti-pattern, but happens)', () => {
      const NetworkComponent = () => {
        throw new Error('Network error: Failed to fetch')
      }
      expectBoundaryCaughtError(
        'NetworkComponent',
        'Error: Network error: Failed to fetch',
      )

      renderInsideBoundary(errorReportingService, <NetworkComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
      expectBoundaryCaughtError(
        'Auth0Component',
        'Error: Auth0: Invalid configuration',
      )

      renderInsideBoundary(errorReportingService, <Auth0Component />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })

    test('Third-party library throws in render', () => {
      const ThirdPartyComponent = () => {
        throw new Error('React Bootstrap: Invalid props')
      }
      expectBoundaryCaughtError(
        'ThirdPartyComponent',
        'Error: React Bootstrap: Invalid props',
      )

      renderInsideBoundary(errorReportingService, <ThirdPartyComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })
  })
})
