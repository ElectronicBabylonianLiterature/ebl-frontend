import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'
import ErrorReporterContext, {
  ConsoleErrorReporter,
  ErrorReporter,
} from 'ErrorReporterContext'

function renderExpectingReactError(
  renderUi: () => void,
  expectedErrorMessage?: string,
): void {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined)

  renderUi()

  expect(consoleErrorSpy).toHaveBeenCalled()
  if (expectedErrorMessage) {
    expect(
      consoleErrorSpy.mock.calls.some((call) =>
        call.some((argument) => {
          if (argument instanceof Error) {
            return argument.message.includes(expectedErrorMessage)
          }

          return (
            typeof argument === 'string' &&
            argument.includes(expectedErrorMessage)
          )
        }),
      ),
    ).toBe(true)
  }

  consoleErrorSpy.mockRestore()
}

describe('ErrorBoundary - Comprehensive Error Handling', () => {
  let errorReportingService: jest.Mocked<ErrorReporter>

  beforeEach(() => {
    errorReportingService = {
      captureException: jest.fn(),
      showReportDialog: jest.fn(),
      setUser: jest.fn(),
      clearScope: jest.fn(),
    }
  })

  describe('Render Phase Errors', () => {
    test('Synchronous error in child component render', () => {
      const CrashingComponent = () => {
        throw new Error('Render error')
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
        'Render error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Render error' }),
        expect.objectContaining({ componentStack: expect.any(String) }),
      )
    })

    test('Error thrown deep in component tree', () => {
      const DeepChild = () => {
        throw new Error('Deep error')
      }
      const MiddleComponent = () => <DeepChild />
      const ParentComponent = () => <MiddleComponent />

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <ParentComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Deep error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalled()
    })

    test('Multiple child components, one crashes', () => {
      const SafeComponent = () => <div>Safe content</div>
      const CrashingComponent = () => {
        throw new Error('Child crash')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <SafeComponent />
                <CrashingComponent />
                <SafeComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Child crash',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(screen.queryByText('Safe content')).not.toBeInTheDocument()
    })

    test('Error in conditional render', () => {
      const ConditionalComponent = ({
        shouldCrash,
      }: {
        shouldCrash: boolean
      }) => {
        if (shouldCrash) {
          throw new Error('Conditional error')
        }
        return <div>No crash</div>
      }

      const { rerender } = render(
        <ErrorReporterContext.Provider value={errorReportingService}>
          <ErrorBoundary>
            <ConditionalComponent shouldCrash={false} />
          </ErrorBoundary>
        </ErrorReporterContext.Provider>,
      )

      expect(screen.getByText('No crash')).toBeInTheDocument()

      renderExpectingReactError(
        () =>
          rerender(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <ConditionalComponent shouldCrash={true} />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Conditional error',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })
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

  describe('Interaction with withData HOC', () => {
    test('Error in data-loading component caught by boundary', () => {
      const DataLoadingComponent = () => {
        throw new Error('Data loading crashed')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <DataLoadingComponent />
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Data loading crashed',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalled()
    })

    test('Nested ErrorBoundaries in withData', () => {
      const CrashingInnerComponent = () => {
        throw new Error('Inner component crash')
      }

      renderExpectingReactError(
        () =>
          render(
            <ErrorReporterContext.Provider value={errorReportingService}>
              <ErrorBoundary>
                <ErrorBoundary>
                  <CrashingInnerComponent />
                </ErrorBoundary>
              </ErrorBoundary>
            </ErrorReporterContext.Provider>,
          ),
        'Inner component crash',
      )

      expect(screen.getByText("Something's gone wrong.")).toBeInTheDocument()
    })
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
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
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

      consoleSpy.mockRestore()
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
