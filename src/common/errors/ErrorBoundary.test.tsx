import React, { FunctionComponent } from 'react'
import { render, screen } from '@testing-library/react'
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

describe('Custom fallback prop', () => {
  function renderWithFallback(fallback: React.ReactNode) {
    silenceConsoleErrors()
    const CrashingComponent: FunctionComponent = () => {
      throw new Error('Error happened!')
    }
    return render(
      <ErrorReporterContext.Provider value={new ConsoleErrorReporter()}>
        <ErrorBoundary fallback={fallback}>
          <CrashingComponent />
        </ErrorBoundary>
      </ErrorReporterContext.Provider>,
    )
  }

  it('Renders the custom fallback instead of the default alert', () => {
    const { container } = renderWithFallback(<div>Custom fallback</div>)

    expect(container).toHaveTextContent('Custom fallback')
    expect(screen.queryByText("Something's gone wrong")).not.toBeInTheDocument()
  })

  it('Renders nothing when fallback is explicitly null', () => {
    const { container } = renderWithFallback(null)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText("Something's gone wrong")).not.toBeInTheDocument()
  })
})
