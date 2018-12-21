
import React from 'react'
import { render } from 'react-testing-library'
import { clickNth } from 'testHelpers'
import ErrorBoundary from './ErrorBoundary'
import ErrorReporterContext from 'ErrorReporterContext'

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
    const CrashingComponent = () => { throw error }
    element = render(<ErrorReporterContext.Provider value={errorReportingService}><ErrorBoundary><CrashingComponent /></ErrorBoundary></ErrorReporterContext.Provider>)
  })

  it('Displays error message if children crash', async () => {
    expect(element.container).toHaveTextContent('Something\'s gone wrong')
  })

  it('Sends report to Sentry', async () => {
    expect(errorReportingService.captureException).toHaveBeenCalledWith(error, { extra: { componentStack: 'some string' } })
  })

  it('Clicking report button opens report dialog', async () => {
    await clickNth(element, 'Send a report', 0)

    expect(errorReportingService.showReportDialog).toHaveBeenCalled()
  })
})

it('Displays children if they do not crash', async () => {
  const content = 'Did not crash'
  const { container } = render(
    <ErrorReporterContext.Provider value={null}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </ErrorReporterContext.Provider>)
  expect(container).toHaveTextContent(content)
})
