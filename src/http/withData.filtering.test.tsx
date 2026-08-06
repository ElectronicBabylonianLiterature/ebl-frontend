import React from 'react'
import { screen } from '@testing-library/react'
import withData from 'http/withData'
import { silenceConsoleErrors } from 'setupTests'
import {
  Props,
  WithDataHarness,
  createWithDataHarness,
  data,
  defaultData,
  errorMessage,
  propValue,
  renderInErrorReporter,
  renderWithData,
} from 'http/withData.testSupport'

let harness: WithDataHarness

beforeEach(() => {
  harness = createWithDataHarness()
})

describe('Filtering', () => {
  it('Calls the filter with props', () => {
    harness.filter.mockReturnValueOnce(false)
    renderWithData(harness)
    expect(harness.filter).toHaveBeenCalledWith({
      prop: propValue,
    })
  })

  it('Does not query the API', () => {
    harness.filter.mockReturnValueOnce(false)
    renderWithData(harness)
    expect(harness.getter).not.toHaveBeenCalled()
  })

  it('Renders the wrapped component with default data', () => {
    harness.filter.mockReturnValueOnce(false)
    renderWithData(harness)
    expect(screen.getByText(`${propValue} ${defaultData}`)).toBeInTheDocument()
  })

  it('Falls back to null data when defaultData is not configured', () => {
    const FilteredComponent = withData<Props, unknown, string>(
      harness.InnerComponent,
      harness.getter,
      { filter: () => false },
    )
    renderInErrorReporter(harness, <FilteredComponent prop={propValue} />)
    expect(harness.getter).not.toHaveBeenCalled()
    expect(harness.InnerComponent).not.toHaveBeenCalled()
  })
})

describe('Child component crash', () => {
  it('Displays error message', async () => {
    silenceConsoleErrors()
    const CrashingComponent = withData<unknown, unknown, string>(
      () => {
        throw new Error(errorMessage)
      },
      () => Promise.resolve(data),
    )
    renderInErrorReporter(harness, <CrashingComponent />)
    await screen.findByText("Something's gone wrong.")
  })
})
