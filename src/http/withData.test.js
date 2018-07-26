import React from 'react'
import { render, wait, cleanup } from 'react-testing-library'
import withData from './withData'
import { AbortError } from 'testHelpers'

const data = 'Test data'
const propValue = 'passed value'
const errorMessage = 'error'
let apiClient
let element

let InnerComponent

async function renderWithData () {
  const ComponentWithData = withData(InnerComponent, props => `path/${props.prop}`)
  element = render(<ComponentWithData apiClient={apiClient} prop={propValue} />)
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  InnerComponent = jest.fn()
  InnerComponent.mockImplementation(props => <h1>Inner Component</h1>)
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

  it('Renders wrapped component on succesful query', () => {
    expect(element.container).toHaveTextContent('Inner Component')
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

describe('When unmounting', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockImplementationOnce(() =>
      Promise.reject(new AbortError(errorMessage)))
    await renderWithData()
  })

  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    expect(element.container).not.toHaveTextContent(errorMessage)
  })

  it('Does not render wrapped component', async () => {
    expect(InnerComponent).not.toHaveBeenCalled()
  })
})
