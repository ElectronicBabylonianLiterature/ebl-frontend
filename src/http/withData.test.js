import React from 'react'
import { render, wait, cleanup } from 'react-testing-library'
import withData from './withData'
import { AbortError } from 'testHelpers'

const data = 'Test data'
const propValue = 'passed value'
const errorMessage = 'error'
let apiClient
let element
let shouldUpdate

let ComponentWithData
let InnerComponent

async function renderWithData () {
  element = render(<ComponentWithData apiClient={apiClient} prop={propValue} />)
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  shouldUpdate = (prevProps, props) => prevProps.prop !== props.prop
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation(props => <h1>{props.prop}</h1>)
  ComponentWithData = withData(InnerComponent, props => `path/${props.prop}`, shouldUpdate)
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
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
  })

  it('Passes properties to inner component', () => {
    expect(InnerComponent).toHaveBeenCalledWith({
      data: data,
      apiClient: apiClient,
      prop: propValue
    },
    {})
  })

  it('Renders the wrapped component', () => {
    expect(element.container).toHaveTextContent(propValue)
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
  const newPropValue = 'new value'
  const newData = 'New Test Data'

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
      expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
    })

    it('Passes properties to inner component', () => {
      expect(InnerComponent).toHaveBeenCalledWith({
        data: newData,
        apiClient: apiClient,
        prop: newPropValue
      },
      {})
    })

    it('Renders the wrapped component', () => {
      expect(element.container).toHaveTextContent(newPropValue)
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
