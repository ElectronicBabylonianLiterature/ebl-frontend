import React from 'react'
import {render, cleanup} from 'react-testing-library'
import ErrorBoundary from './ErrorBoundary'

afterEach(cleanup)

it('Displays error message if children chrash', async () => {
  const message = 'Error happened!'
  const CrashingComponent = () => { throw new Error(message) }
  const {container} = render(<ErrorBoundary><CrashingComponent /></ErrorBoundary>)

  expect(container).toHaveTextContent(message)
})

it('Displays children if they do not crash', async () => {
  const content = 'Did not crash'
  const {container} = render(<ErrorBoundary>{content}</ErrorBoundary>)

  expect(container).toHaveTextContent(content)
})
