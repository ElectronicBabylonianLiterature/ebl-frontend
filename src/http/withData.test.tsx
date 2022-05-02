import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'
import withData, { Config, WithData } from './withData'
import ErrorReporterContext, {
  ErrorReporter,
  ConsoleErrorReporter,
} from 'ErrorReporterContext'

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
    </ErrorReporterContext.Provider>
  )
}

function clearMocks(): void {
  InnerComponent.mockClear()
  getter.mockClear()
}

function expectGetterToBeCalled(expectedProp: string): void {
  it('Calls getter with props', () => {
    expect(getter).toBeCalledWith({ prop: expectedProp })
  })
}

function expectWrappedComponentToBeRendered(
  expectedPropValue: string,
  expectedData: string
): void {
  it('Renders the wrapped component', () => {
    expect(
      screen.getByText(`${expectedPropValue} ${expectedData}`)
    ).toBeInTheDocument()
  })

  it('Passes properties to inner component', () => {
    expect(InnerComponent).toHaveBeenCalledWith(
      {
        data: expectedData,
        prop: expectedPropValue,
      },
      {}
    )
  })
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
    defaultData,
  }
  ComponentWithData = withData<Props, unknown, string>(
    InnerComponent,
    getter,
    config
  )
})

describe('On successful get', () => {
  let rerender: (
    ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  ) => void

  function rerenderView(prop: string): void {
    rerender(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ComponentWithData prop={prop} />{' '}
      </ErrorReporterContext.Provider>
    )
  }

  beforeEach(async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    rerender = renderWithData().rerender
    await screen.findByText(RegExp(propValue))
  })

  expectGetterToBeCalled(propValue)
  expectWrappedComponentToBeRendered(propValue, data)

  describe('When updating', () => {
    beforeEach(async () => {
      clearMocks()
      getter.mockReturnValueOnce(Promise.resolve(newData))
    })

    describe('Prop updated', () => {
      beforeEach(async () => {
        rerenderView(newPropValue)
        await screen.findByText(RegExp(newPropValue))
      })

      expectGetterToBeCalled(newPropValue)
      expectWrappedComponentToBeRendered(newPropValue, newData)
    })

    describe('Prop did not update', () => {
      beforeEach(() => {
        rerenderView(propValue)
      })

      it('Does not query the API', () => {
        expect(getter).not.toHaveBeenCalled()
      })

      it('Does not rerender inner component', () => {
        expect(InnerComponent).not.toHaveBeenCalledWith()
      })
    })
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    getter.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    renderWithData()
    await screen.findByText(errorMessage)
  })

  it('Does not render wrapped component', () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  let promise: Promise<string>

  beforeEach(async () => {
    promise = new Promise(_.noop)
    getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData()
    unmount()
  })

  it('Cancels the promise', () => {
    expect(promise.isCancelled()).toBe(true)
  })

  it('Does not show error', () => {
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
  })

  it('Does not render wrapped component', () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('Filtering', () => {
  beforeEach(async () => {
    filter.mockReturnValueOnce(false)
    renderWithData()
  })

  it('Calls the filter with props', () => {
    expect(filter).toHaveBeenCalledWith({
      prop: propValue,
    })
  })

  it('Does not query the API', () => {
    expect(getter).not.toHaveBeenCalled()
  })

  expectWrappedComponentToBeRendered(propValue, defaultData)
})

describe('Child component crash', () => {
  it('Displays error message', async () => {
    const CrashingComponent = withData<unknown, unknown, string>(
      () => {
        throw new Error(errorMessage)
      },
      () => Promise.resolve(data)
    )
    render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <CrashingComponent />
      </ErrorReporterContext.Provider>
    )
    await screen.findByText("Something's gone wrong.")
  })
})
