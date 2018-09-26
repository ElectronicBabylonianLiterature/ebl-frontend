import React from 'react'
import { render, wait } from 'react-testing-library'
import Promise from 'bluebird'
import _ from 'lodash'
import ApiClient from 'http/ApiClient'
import withData from './withData'

const data = 'Test data'
const defaultData = 'Default data'
const newData = 'New Test Data'
const propValue = 'passed value'
const newPropValue = 'new value'
const errorMessage = 'error'
const authorize = false
let apiClient
let element
let filter
let config

let ComponentWithData
let InnerComponent

async function renderWithData () {
  element = render(<ComponentWithData apiClient={apiClient} prop={propValue} />)
  await wait()
}

async function rerender (prop) {
  element.rerender(<ComponentWithData apiClient={apiClient} prop={prop} />)
  await wait()
}

function clearMocks () {
  InnerComponent.mockClear()
  apiClient.fetchJson.mockClear()
}

function expectApiToBeCalled (expectedPath) {
  it('Queries the API correct path', () => {
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, authorize)
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
      apiClient: apiClient,
      prop: expectedPropValue
    },
    {})
  })
}

beforeEach(async () => {
  const shouldUpdate = (prevProps, props) => prevProps.prop !== props.prop
  const method = 'fetchJson'
  filter = jest.fn()
  filter.mockReturnValue(true)
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation(props => <h1>{props.prop} {props.data}</h1>)
  config = {
    shouldUpdate,
    authorize,
    filter,
    defaultData,
    method: method
  }
  ComponentWithData = withData(InnerComponent, props => `path/${props.prop}`, config)
  apiClient = new ApiClient({})
  jest.spyOn(apiClient, method)
})

describe('On successful request', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(data))
    await renderWithData()
  })

  expectApiToBeCalled(`path/${propValue}`)
  expectWrappedComponentToBeRendered(propValue, data)

  describe('When updating', () => {
    beforeEach(async () => {
      clearMocks()
      apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(newData))
    })

    describe('Prop updated', () => {
      beforeEach(async () => rerender(newPropValue))

      expectApiToBeCalled(`path/${newPropValue}`)
      expectWrappedComponentToBeRendered(newPropValue, newData)
    })

    describe('Prop did not update', () => {
      beforeEach(async () => rerender(propValue))

      it('Does not query the API', () => {
        expect(apiClient.fetchJson).not.toHaveBeenCalled()
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
      apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(newData))
      reload()
      await wait()
    })

    expectApiToBeCalled(`path/${propValue}`)
    expectWrappedComponentToBeRendered(propValue, newData)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)))
    await renderWithData()
  })

  it('Displays an error', async () => {
    expect(element.container).toHaveTextContent(errorMessage)
  })

  it('Does not render wrapped component', async () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  let promise

  beforeEach(async () => {
    promise = new Promise(_.noop)
    apiClient.fetchJson.mockReturnValueOnce(promise)
    await renderWithData()
    element.unmount()
  })

  it('Cancels fetch', () => {
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
      apiClient: apiClient,
      prop: propValue
    })
  })

  it('Does not query the API', () => {
    expect(apiClient.fetchJson).not.toHaveBeenCalled()
  })

  expectWrappedComponentToBeRendered(propValue, defaultData)
})

describe('Child component crash', () => {
  beforeEach(async () => {
    const CrashingComponent = withData(() => { throw new Error(errorMessage) }, props => `path/${props.prop}`)
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(data))
    element = render(<CrashingComponent apiClient={apiClient} prop={propValue} />)
    await wait()
  })

  it('Displays error message', () => {
    expect(element.container).toHaveTextContent('Something\'s gone wrong.')
  })
})
