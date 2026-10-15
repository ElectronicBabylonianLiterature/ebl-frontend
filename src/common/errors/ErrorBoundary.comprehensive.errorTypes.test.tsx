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

  describe('Error Types and Messages', () => {
    test('TypeError in component', () => {
      const emptyRecords: { property: string }[] = []
      const TypeErrorComponent = () => <div>{emptyRecords[0].property}</div>
      expectBoundaryCaughtError(
        'TypeErrorComponent',
        "TypeError: Cannot read properties of undefined (reading 'property')",
      )

      renderInsideBoundary(errorReportingService, <TypeErrorComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TypeError' }),
        expect.any(Object),
      )
    })

    test('ReferenceError in component', () => {
      const ReferenceErrorComponent = () => {
        throw new ReferenceError('undefinedVariable is not defined')
      }
      expectBoundaryCaughtError(
        'ReferenceErrorComponent',
        'ReferenceError: undefinedVariable is not defined',
      )

      renderInsideBoundary(errorReportingService, <ReferenceErrorComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
      expectBoundaryCaughtError(
        'CustomErrorComponent',
        'CustomError: Custom error message',
      )

      renderInsideBoundary(errorReportingService, <CustomErrorComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
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
      expectBoundaryCaughtError('LongMessageComponent', `Error: ${longMessage}`)

      renderInsideBoundary(errorReportingService, <LongMessageComponent />)

      expect(screen.getByText(fallbackMessage)).toBeInTheDocument()
      expect(errorReportingService.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: longMessage }),
        expect.any(Object),
      )
    })
  })
})
