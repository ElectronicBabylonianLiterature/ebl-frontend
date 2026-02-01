import React, { FunctionComponent } from 'react'
import { render } from '@testing-library/react'
import { clickNth } from 'test-support/utils'
import ErrorBoundary from './ErrorBoundary'
import ErrorReporterContext, {
  ConsoleErrorReporter,
} from 'ErrorReporterContext'
import { silenceConsoleErrors } from 'setupTests'

describe('Children throw an error', () => {
  let element
  let error
  let errorReportingService

  function setup() {
    silenceConsoleErrors()
    error = new Error('Error happened!')
    errorReportingService = {
      captureException: jest.fn(),
      showReportDialog: jest.fn(),
    }
    const CrashingComponent: FunctionComponent = () => {
      throw error
    }
    element = render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ErrorBoundary>
          <CrashingComponent />
        </ErrorBoundary>
      </ErrorReporterContext.Provider>,
    )
  }

  it('Displays error message if children crash', () => {
    setup()
    expect(element.container).toHaveTextContent("Something's gone wrong")
  })

  it('Sends report to Sentry', () => {
    setup()
    expect(errorReportingService.captureException).toHaveBeenCalledWith(error, {
      componentStack: expect.any(String),
    })
  })

  it('Clicking report button opens report dialog', async () => {
    setup()
    await clickNth(element, 'Send a report', 0)

    expect(errorReportingService.showReportDialog).toHaveBeenCalled()
  })
})

it('Displays children if they do not crash', () => {
  const content = 'Did not crash'
  const { container } = render(
    <ErrorReporterContext.Provider value={new ConsoleErrorReporter()}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </ErrorReporterContext.Provider>,
  )
  expect(container).toHaveTextContent(content)
})
