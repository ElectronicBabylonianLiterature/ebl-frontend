import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Promise from 'bluebird'
import withData, { WithData } from './withData'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'

interface Props {
  prop: string
}

const data = 'Test data'
const propValue = 'passed value'
const errorMessage = 'error'

const errorReportingService: ErrorReporter = {
  captureException: jest.fn(),
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

function renderWithConfig(retry: boolean, getter: jest.Mock): void {
  const InnerComponent = (props: WithData<Props, string>): JSX.Element => (
    <h1>
      {props.prop} {props.data}
    </h1>
  )
  const ComponentWithData = withData<Props, unknown, string>(
    InnerComponent,
    getter,
    { retry },
  )
  render(
    <ErrorReporterContext.Provider value={errorReportingService}>
      <ComponentWithData prop={propValue} />
    </ErrorReporterContext.Provider>,
  )
}

test('does not show a retry button when retry is not enabled', async () => {
  const getter = jest
    .fn()
    .mockReturnValue(Promise.reject(new Error(errorMessage)))
  renderWithConfig(false, getter)

  await screen.findByText(errorMessage)

  expect(
    screen.queryByRole('button', { name: 'Retry' }),
  ).not.toBeInTheDocument()
})

test('re-queries the API when the retry button is clicked', async () => {
  const getter = jest
    .fn()
    .mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
    .mockReturnValueOnce(Promise.resolve(data))
  renderWithConfig(true, getter)

  await screen.findByText(errorMessage)
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(await screen.findByText(`${propValue} ${data}`)).toBeInTheDocument()
  expect(getter).toHaveBeenCalledTimes(2)
})

test('keeps re-querying the API on every repeated retry', async () => {
  const getter = jest
    .fn()
    .mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    .mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    .mockImplementationOnce(() => Promise.resolve(data))
  renderWithConfig(true, getter)

  await screen.findByText(errorMessage)
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  await screen.findByText(errorMessage)
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(await screen.findByText(`${propValue} ${data}`)).toBeInTheDocument()
  expect(getter).toHaveBeenCalledTimes(3)
})

test('updates the retry counter from its current value', () => {
  const originalUseState = React.useState
  const setRetryCount = jest.fn()
  let useStateCall = 0
  const useStateSpy = jest.spyOn(React, 'useState').mockImplementation(((
    initialState: unknown,
  ) => {
    useStateCall += 1
    if (useStateCall === 2) {
      return [new Error(errorMessage), jest.fn()]
    }
    if (useStateCall === 3) {
      return [0, setRetryCount]
    }
    return originalUseState(initialState)
  }) as typeof React.useState)

  try {
    renderWithConfig(
      true,
      jest.fn(() => new Promise(() => undefined)),
    )
    screen.getByRole('button', { name: 'Retry' }).click()

    const updateRetryCount = setRetryCount.mock.calls[0][0]
    expect(updateRetryCount(7)).toBe(8)
  } finally {
    useStateSpy.mockRestore()
  }
})
