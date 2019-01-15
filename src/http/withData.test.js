import React from 'react'
import { render, wait, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import _ from 'lodash'
import withData from './withData'
import ErrorReporterContext from 'ErrorReporterContext'

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
let errorReportingService

errorReportingService = {
  captureException: jest.fn()
}

async function renderWithData () {
  element = render(<ErrorReporterContext.Provider value={errorReportingService}><ComponentWithData prop={propValue} /> </ErrorReporterContext.Provider>)
  await wait()
}

async function rerender (prop) {
  element.rerender(<ErrorReporterContext.Provider value={errorReportingService}><ComponentWithData prop={prop} /> </ErrorReporterContext.Provider>)
  await wait()
}

function clearMocks () {
  InnerComponent.mockClear()
  getter.mockClear()
}

function expectGetterToBeCalled (expectedProp) {
  it('Calls getter with props', () => {
    expect(getter).toBeCalledWith({ prop: expectedProp })
  })
}

function expectWrappedComponentToBeRendered (expectedPropValue, expectedData) {
  it('Renders the wrapped component', () => {
    expect(element.container).toHaveTextContent(`${expectedPropValue} ${expectedData}`)
  })

  it('Passes properties to inner component', () => {
    expect(InnerComponent).toHaveBeenCalledWith({
      data: expectedData,
      reload: expect.any(Function),
      prop: expectedPropValue
    },
    {})
  })
}

beforeEach(async () => {
  const shouldUpdate = (prevProps, props) => prevProps.prop !== props.prop
  filter = jest.fn()
  filter.mockReturnValue(true)
  getter = jest.fn()
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation(props => <h1>{props.prop} {props.data}</h1>)
  config = {
    shouldUpdate,
    filter,
    defaultData
  }
  ComponentWithData = withData(InnerComponent, getter, config)
})

describe('On successful get', () => {
  beforeEach(async () => {
    getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData()
    await waitForElement(() => element.getByText(RegExp(propValue)))
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
        rerender(newPropValue)
        await waitForElement(() => element.getByText(RegExp(newPropValue)))
      })

      expectGetterToBeCalled(newPropValue)
      expectWrappedComponentToBeRendered(newPropValue, newData)
    })

    describe('Prop did not update', () => {
      beforeEach(async () => {
        rerender(propValue)
        await wait()
      })

      it('Does not query the API', () => {
        expect(getter).not.toHaveBeenCalled()
      })

      it('Does not rerender inner component', () => {
        expect(InnerComponent).not.toHaveBeenCalledWith()
      })
    })
  })

  describe('Reload', () => {
    beforeEach(async () => {
      const reload = InnerComponent.mock.calls[0][0].reload
      clearMocks()
      getter.mockReturnValueOnce(Promise.resolve(newData))
      reload()
      await waitForElement(() => element.getByText(RegExp(propValue)))
    })

    expectGetterToBeCalled(propValue)
    expectWrappedComponentToBeRendered(propValue, newData)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    getter.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)))
    renderWithData()
    await waitForElement(() => element.getByText(errorMessage))
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
      prop: propValue
    })
  })

  it('Does not query the API', () => {
    expect(getter).not.toHaveBeenCalled()
  })

  expectWrappedComponentToBeRendered(propValue, defaultData)
})

describe('Child component crash', () => {
  beforeEach(async () => {
    const CrashingComponent = withData(() => { throw new Error(errorMessage) }, getter)
    getter.mockReturnValueOnce(Promise.resolve(data))
    element = render(<ErrorReporterContext.Provider value={errorReportingService}><CrashingComponent prop={propValue} /></ErrorReporterContext.Provider>)
    await wait()
  })

  it('Displays error message', () => {
    expect(element.container).toHaveTextContent('Something\'s gone wrong.')
  })
})
