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
})
