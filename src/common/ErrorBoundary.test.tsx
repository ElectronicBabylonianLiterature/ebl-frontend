import React, { FunctionComponent } from 'react'
import { render } from '@testing-library/react'
import { clickNth } from 'test-helpers/utils'
import ErrorBoundary from './ErrorBoundary'
import ErrorReporterContext, {
  ConsoleErrorReporter
} from 'ErrorReporterContext'

describe('Children throw an error', () => {
  let element
  let error
  let errorReportingService

  beforeEach(async () => {
    error = new Error('Error happened!')
    errorReportingService = {
      captureException: jest.fn(),
      showReportDialog: jest.fn()
    }
    const CrashingComponent: FunctionComponent = () => {
      throw error
    }
    element = render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ErrorBoundary>
          <CrashingComponent />
        </ErrorBoundary>
      </ErrorReporterContext.Provider>
    )
  })

  it('Displays error message if children crash', () => {
    expect(element.container).toHaveTextContent("Something's gone wrong")
  })

  it('Sends report to Sentry', () => {
    expect(errorReportingService.captureException).toHaveBeenCalledWith(error, {
      componentStack: expect.any(String)
    })
  })

  it('Clicking report button opens report dialog', async () => {
    clickNth(element, 'Send a report', 0)

    expect(errorReportingService.showReportDialog).toHaveBeenCalled()
  })
})

it('Displays children if they do not crash', () => {
  const content = 'Did not crash'
  const { container } = render(
    <ErrorReporterContext.Provider value={new ConsoleErrorReporter()}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </ErrorReporterContext.Provider>
  )
  expect(container).toHaveTextContent(content)
})
