import React from 'react'
import { render, wait, cleanup } from 'react-testing-library'
import withData from './withData'
import { AbortError } from 'testHelpers'

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

let ComponentWithData
let InnerComponent

async function renderWithData () {
  element = render(<ComponentWithData apiClient={apiClient} prop={propValue} />)
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  const shouldUpdate = (prevProps, props) => prevProps.prop !== props.prop
  filter = jest.fn()
  filter.mockReturnValue(true)
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation(props => <h1>{props.prop} {props.data}</h1>)
  ComponentWithData = withData(InnerComponent, props => `path/${props.prop}`, shouldUpdate, authorize, filter, defaultData)
  apiClient = {
    fetchJson: jest.fn()
  }
})

describe('On successful request', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(data))
    await renderWithData()
  })

  it('Queries the API correct path', () => {
    const expectedPath = `path/${propValue}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, authorize, AbortController.prototype.signal)
  })

  it('Passes properties to inner component', () => {
    expect(InnerComponent).toHaveBeenCalledWith({
      data: data,
      reload: expect.any(Function),
      apiClient: apiClient,
      prop: propValue
    },
    {})
  })

  it('Renders the wrapped component', () => {
    expect(element.container).toHaveTextContent(`${propValue} ${data}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)))
    await renderWithData()
  })

  it('Displays an error on failed query', async () => {
    expect(element.container).toHaveTextContent(errorMessage)
  })

  it('Does not render wrapped component on error', async () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('On aborted request', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockImplementationOnce(() =>
      Promise.reject(new AbortError(errorMessage)))
    await renderWithData()
  })

  it('Ignores AbortError', async () => {
    expect(element.container).not.toHaveTextContent(errorMessage)
  })

  it('Does not render wrapped component', async () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When updating', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(data))
    await renderWithData()
    InnerComponent.mockClear()
    apiClient.fetchJson.mockClear()
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(newData))
  })

  describe('Prop changes', () => {
    beforeEach(async () => {
      element.rerender(<ComponentWithData apiClient={apiClient} prop={newPropValue} />)
      await wait()
    })

    it('Queries the API correct path', () => {
      const expectedPath = `path/${newPropValue}`
      expect(apiClient.fetchJson).toBeCalledWith(expectedPath, authorize, AbortController.prototype.signal)
    })

    it('Passes properties to inner component', () => {
      expect(InnerComponent).toHaveBeenCalledWith({
        data: newData,
        reload: expect.any(Function),
        apiClient: apiClient,
        prop: newPropValue
      },
      {})
    })

    it('Renders the wrapped component', () => {
      expect(element.container).toHaveTextContent(`${newPropValue} ${newData}`)
    })
  })

  describe('Prop does not change', () => {
    beforeEach(async () => {
      element.rerender(<ComponentWithData apiClient={apiClient} prop={propValue} />)
      await wait()
    })

    it('Does not query the API', () => {
      expect(apiClient.fetchJson).not.toHaveBeenCalled()
    })

    it('Does not rerender inner component', () => {
      expect(InnerComponent).not.toHaveBeenCalledWith()
    })
  })
})

describe('Filtering', () => {
  beforeEach(async () => {
    filter.mockReturnValueOnce(false)
    await renderWithData()
  })

  it('Calls filter with props', () => {
    expect(filter).toHaveBeenCalledWith({
      apiClient: apiClient,
      prop: propValue
    })
  })

  it('Does not query the API', () => {
    expect(apiClient.fetchJson).not.toHaveBeenCalled()
  })

  it('Passes default data to the wrapped component', () => {
    expect(InnerComponent).toHaveBeenCalledWith({
      data: defaultData,
      reload: expect.any(Function),
      apiClient: apiClient,
      prop: propValue
    },
    {})
  })
})

describe('Reload', () => {
  let reload

  beforeEach(async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(data))
    await renderWithData()
    reload = InnerComponent.mock.calls[0][0].reload
    InnerComponent.mockClear()
    apiClient.fetchJson.mockClear()
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(newData))
    reload()
    await wait()
  })

  it('Queries the API correct path', () => {
    const expectedPath = `path/${propValue}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, authorize, AbortController.prototype.signal)
  })

  it('Passes properties to inner component', () => {
    expect(InnerComponent).toHaveBeenCalledWith({
      data: newData,
      reload: expect.any(Function),
      apiClient: apiClient,
      prop: propValue
    },
    {})
  })

  it('Renders the wrapped component', () => {
    expect(element.container).toHaveTextContent(`${propValue} ${newData}`)
  })
})

describe('When unmounting', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockImplementationOnce(() =>
      Promise.reject(new AbortError(errorMessage)))
    await renderWithData()
    element.unmount()
  })

  it('Aborts fetch', () => {
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })
})
