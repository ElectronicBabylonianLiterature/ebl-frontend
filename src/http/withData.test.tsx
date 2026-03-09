import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'
import withData, { Config, WithData } from './withData'
import ErrorReporterContext, {
  ErrorReporter,
  ConsoleErrorReporter,
} from 'ErrorReporterContext'
import { silenceConsoleErrors } from 'setupTests'

interface Props {
  prop: string
}

const data = 'Test data'
const defaultData = 'Default data'
const newData = 'New Test Data'
const propValue = 'passed value'
const newPropValue = 'new value'
const errorMessage = 'error'

let filter: jest.Mock<boolean, [Props]>
let config: Config<Props, string>
let getter: jest.Mock<Promise<string>, [Props]>
let ComponentWithData: React.ComponentType<Props>
let InnerComponent: jest.Mock<JSX.Element, [WithData<Props, string>]>

const errorReportingService: ErrorReporter = new ConsoleErrorReporter()

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
})

describe('On successful get', () => {
  function rerenderView(
    rerender: RenderResult['rerender'],
    prop: string,
  ): void {
    rerender(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ComponentWithData prop={prop} />{' '}
      </ErrorReporterContext.Provider>,
    )
  }

  it('Calls getter with props', async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData()
    await screen.findByText(RegExp(propValue))
    expect(getter).toBeCalledWith({ prop: propValue })
  })

  it('Renders the wrapped component', async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData()
    await screen.findByText(RegExp(propValue))
    expect(screen.getByText(`${propValue} ${data}`)).toBeInTheDocument()
  })

  it('Passes properties to inner component', async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData()
    await screen.findByText(RegExp(propValue))
    expect(InnerComponent).toHaveBeenCalledWith(
      {
        data,
        prop: propValue,
      },
      {},
    )
  })

  it('Queries again when prop updated', async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    const { rerender } = renderWithData()
    await screen.findByText(RegExp(propValue))

    InnerComponent.mockClear()
    getter.mockClear()
    getter.mockReturnValueOnce(Promise.resolve(newData))
    rerenderView(rerender, newPropValue)
    await screen.findByText(RegExp(newPropValue))

    expect(getter).toBeCalledWith({ prop: newPropValue })
    expect(screen.getByText(`${newPropValue} ${newData}`)).toBeInTheDocument()
  })

  it('Does not query the API when prop did not update', async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    const { rerender } = renderWithData()
    await screen.findByText(RegExp(propValue))

    InnerComponent.mockClear()
    getter.mockClear()
    rerenderView(rerender, propValue)

    expect(getter).not.toHaveBeenCalled()
    expect(screen.getByText(`${propValue} ${data}`)).toBeInTheDocument()
  })
})

describe('On failed request', () => {
  it('Does not render wrapped component', async () => {
    getter.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    renderWithData()
    await screen.findByText(errorMessage)
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Cancels the promise', () => {
    const promise: Promise<string> = new Promise(_.noop)
    getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData()
    unmount()
    expect(promise.isCancelled()).toBe(true)
  })

  it('Does not show error', () => {
    const promise: Promise<string> = new Promise(_.noop)
    getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData()
    unmount()
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
  })

  it('Does not render wrapped component', () => {
    const promise: Promise<string> = new Promise(_.noop)
    getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData()
    unmount()
    expect(InnerComponent).not.toHaveBeenCalled()
  })
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
