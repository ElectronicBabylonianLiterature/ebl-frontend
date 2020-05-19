import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'
import withData from './withData'
import ErrorReporterContext, {
  ErrorReporter,
  ConsoleErrorReporter,
} from 'ErrorReporterContext'

const data = 'Test data'
const defaultData = 'Default data'
const newData = 'New Test Data'
const propValue = 'passed value'
const newPropValue = 'new value'
const errorMessage = 'error'

let element
let filter
let config
let getter

let ComponentWithData
let InnerComponent

const errorReportingService: ErrorReporter = new ConsoleErrorReporter()

interface Props {
  prop: string
}

async function renderWithData(): Promise<void> {
  await act(async () => {
    element = render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ComponentWithData prop={propValue} />{' '}
      </ErrorReporterContext.Provider>
    )
  })
}

async function rerender(prop): Promise<void> {
  await act(async () => {
    element.rerender(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <ComponentWithData prop={prop} />{' '}
      </ErrorReporterContext.Provider>
    )
  })
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
    expect(element.container).toHaveTextContent(
      `${expectedPropValue} ${expectedData}`
    )
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
  InnerComponent.mockImplementation((props) => (
    <h1>
      {props.prop} {props.data}
    </h1>
  ))
  config = {
    watch,
    filter,
    defaultData,
  }
  ComponentWithData = withData(InnerComponent, getter, config)
})

describe('On successful get', () => {
  beforeEach(async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    await renderWithData()
    await element.findByText(RegExp(propValue))
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
        await rerender(newPropValue)
        await element.findByText(RegExp(newPropValue))
      })

      expectGetterToBeCalled(newPropValue)
      expectWrappedComponentToBeRendered(newPropValue, newData)
    })

    describe('Prop did not update', () => {
      beforeEach(async () => {
        await rerender(propValue)
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
    await renderWithData()
    await element.findByText(errorMessage)
  })

  it('Does not render wrapped component', () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  let promise

  beforeEach(async () => {
    promise = new Promise(_.noop)
    getter.mockReturnValueOnce(promise)
    await renderWithData()
    element.unmount()
  })

  it('Cancels the promise', () => {
    expect(promise.isCancelled()).toBe(true)
  })

  it('Does not show error', () => {
    expect(element.container).not.toHaveTextContent(errorMessage)
  })

  it('Does not render wrapped component', () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('Filtering', () => {
  beforeEach(async () => {
    filter.mockReturnValueOnce(false)
    await renderWithData()
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
  beforeEach(() => {
    const CrashingComponent = withData<{}, {}, string>(() => {
      throw new Error(errorMessage)
    }, getter)
    getter.mockReturnValueOnce(Promise.resolve(data))
    element = render(
      <ErrorReporterContext.Provider value={errorReportingService}>
        <CrashingComponent />
      </ErrorReporterContext.Provider>
    )
  })

  it('Displays error message', async () => {
    await element.findByText("Something's gone wrong.")
  })
})
