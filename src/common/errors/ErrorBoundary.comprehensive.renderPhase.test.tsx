import React from 'react'
import { render, screen } from '@testing-library/react'
import { ErrorReporter } from 'ErrorReporterContext'
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

  describe('Render Phase Errors', () => {
    test('Synchronous error in child component render', () => {
      const CrashingComponent = () => {
        throw new Error('Render error')
      }
      expectBoundaryCaughtError('CrashingComponent', 'Error: Render error')

      renderInsideBoundary(errorReportingService, <CrashingComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
      expectBoundaryCaughtError('DeepChild', 'Error: Deep error')

      renderInsideBoundary(errorReportingService, <ParentComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalled()
    })

    test('Multiple child components, one crashes', () => {
      const SafeComponent = () => <div>Safe content</div>
      const CrashingComponent = () => {
        throw new Error('Child crash')
      }
      expectBoundaryCaughtError('CrashingComponent', 'Error: Child crash')

      renderInsideBoundary(
        errorReportingService,
        <>
          <SafeComponent />
          <CrashingComponent />
          <SafeComponent />
        </>,
      )

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
        withinBoundary(
          errorReportingService,
          <ConditionalComponent shouldCrash={false} />,
        ),
      )

      expect(screen.getByText('No crash')).toBeInTheDocument()

      expectBoundaryCaughtError(
        'ConditionalComponent',
        'Error: Conditional error',
      )
      rerender(
        withinBoundary(
          errorReportingService,
          <ConditionalComponent shouldCrash={true} />,
        ),
      )

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
    })
  })
})
