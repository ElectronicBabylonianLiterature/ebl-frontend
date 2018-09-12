/* global Raven */
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { clickNth } from 'testHelpers'
import ErrorBoundary from './ErrorBoundary'

afterEach(cleanup)

describe('Children throw an error', () => {
  let element
  let error

  beforeEach(async () => {
    error = new Error('Error happened!')
    Raven.lastEventId.mockReturnValueOnce('mockEventId')
    const CrashingComponent = () => { throw error }
    element = render(<ErrorBoundary><CrashingComponent /></ErrorBoundary>)
  })

  it('Displays error message if children crash', async () => {
    expect(element.container).toHaveTextContent('Something\'s gone wrong')
  })

  it('Sends report to Sentry', async () => {
    expect(Raven.captureException).toHaveBeenCalledWith(error, { extra: { componentStack: expect.any(String) } })
  })

  it('Clicking report button opens report dialog', async () => {
    await clickNth(element, 'Send a report', 0)

    expect(Raven.showReportDialog).toHaveBeenCalled()
  })
})

it('Displays children if they do not crash', async () => {
  const content = 'Did not crash'
  const { container } = render(<ErrorBoundary>{content}</ErrorBoundary>)

  expect(container).toHaveTextContent(content)
})
