import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import withData, { Config, WithData } from './withData'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'
import { silenceConsoleErrors } from 'setupTests'

interface Props {
  prop: string
}

const data = 'Test data'
const defaultData = 'Default data'
const propValue = 'passed value'
const errorMessage = 'error'

let filter: jest.Mock<boolean, [Props]>
let config: Config<Props, string>
let getter: jest.Mock<Promise<string>, [Props, AbortSignal]>
let ComponentWithData: React.ComponentType<Props>
let InnerComponent: jest.Mock<JSX.Element, [WithData<Props, string>]>

let errorReportingService: ErrorReporter

function renderWithData(): RenderResult {
  return render(
    <ErrorReporterContext.Provider value={errorReportingService}>
      <ComponentWithData prop={propValue} />{' '}
    </ErrorReporterContext.Provider>,
  )
}

beforeEach(async () => {
  const watch = (props: Props): [string] => [props.prop]
  filter = jest.fn()
  filter.mockReturnValue(true)
  getter = jest.fn()
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation((props: WithData<Props, string>) => (
    <h1>
      {props.prop} {props.data}
    </h1>
  ))
  config = {
    watch,
    filter,
    defaultData: () => defaultData,
  }
  ComponentWithData = withData<Props, unknown, string>(
    InnerComponent,
    getter,
    config,
  )
  errorReportingService = {
    captureException: jest.fn(),
    showReportDialog: jest.fn(),
    setUser: jest.fn(),
    clearScope: jest.fn(),
  }
})
describe('Filtering', () => {
  it('Calls the filter with props', () => {
    filter.mockReturnValueOnce(false)
    renderWithData()
    expect(filter).toHaveBeenCalledWith({
      prop: propValue,
    })
  })

  it('Does not query the API', () => {
    filter.mockReturnValueOnce(false)
    renderWithData()
    expect(getter).not.toHaveBeenCalled()
  })

  it('Renders the wrapped component with default data', () => {
    filter.mockReturnValueOnce(false)
    renderWithData()
    expect(screen.getByText(`${propValue} ${defaultData}`)).toBeInTheDocument()
  })

  it('Falls back to null data when defaultData is not configured', () => {
    const FilteredComponent = withData<Props, unknown, string>(
      InnerComponent,
      getter,
      { filter: () => false },
    )
    render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <FilteredComponent prop={propValue} />
      </ErrorReporterContext.Provider>,
    )
    expect(getter).not.toHaveBeenCalled()
    expect(InnerComponent).not.toHaveBeenCalled()
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
    render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <CrashingComponent />
      </ErrorReporterContext.Provider>,
    )
    await screen.findByText("Something's gone wrong.")
  })
})
