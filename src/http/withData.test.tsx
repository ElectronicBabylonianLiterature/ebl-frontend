import { RenderResult, screen, waitFor } from '@testing-library/react'
import _ from 'lodash'
import {
  WithDataHarness,
  createWithDataHarness,
  data,
  errorMessage,
  newData,
  newPropValue,
  propValue,
  renderWithData,
  rerenderWithData,
} from 'http/withData.testSupport'

let harness: WithDataHarness

beforeEach(() => {
  harness = createWithDataHarness()
})

describe('On successful get', () => {
  function rerenderView(
    rerender: RenderResult['rerender'],
    prop: string,
  ): void {
    rerenderWithData(harness, rerender, prop)
  }

  it('Calls getter with props', async () => {
    harness.getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData(harness)
    await screen.findByText(RegExp(propValue))
    expect(harness.getter).toBeCalledWith(
      { prop: propValue },
      expect.any(AbortSignal),
    )
  })

  it('Renders the wrapped component', async () => {
    harness.getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData(harness)
    await screen.findByText(RegExp(propValue))
    expect(screen.getByText(`${propValue} ${data}`)).toBeInTheDocument()
  })

  it('Passes properties to inner component', async () => {
    harness.getter.mockReturnValueOnce(Promise.resolve(data))
    renderWithData(harness)
    await screen.findByText(RegExp(propValue))
    expect(harness.InnerComponent).toHaveBeenCalledWith(
      {
        data,
        prop: propValue,
      },
      {},
    )
  })

  it('Queries again when prop updated', async () => {
    harness.getter.mockReturnValueOnce(Promise.resolve(data))
    const { rerender } = renderWithData(harness)
    await screen.findByText(RegExp(propValue))

    harness.InnerComponent.mockClear()
    harness.getter.mockClear()
    harness.getter.mockReturnValueOnce(Promise.resolve(newData))
    rerenderView(rerender, newPropValue)
    await screen.findByText(RegExp(newPropValue))

    expect(harness.getter).toBeCalledWith(
      { prop: newPropValue },
      expect.any(AbortSignal),
    )
    expect(screen.getByText(`${newPropValue} ${newData}`)).toBeInTheDocument()
  })

  it('Ignores stale response when watched prop changes rapidly', async () => {
    let resolveFirst:
      | ((value: string | PromiseLike<string>) => void)
      | undefined
    let resolveSecond:
      | ((value: string | PromiseLike<string>) => void)
      | undefined

    harness.getter
      .mockImplementationOnce(
        () =>
          new globalThis.Promise<string>((resolve) => {
            resolveFirst = resolve
          }) as unknown as Promise<string>,
      )
      .mockImplementationOnce(
        () =>
          new globalThis.Promise<string>((resolve) => {
            resolveSecond = resolve
          }) as unknown as Promise<string>,
      )

    const { rerender } = renderWithData(harness)
    rerenderView(rerender, newPropValue)

    resolveSecond?.(newData)
    await screen.findByText(`${newPropValue} ${newData}`)

    resolveFirst?.(data)

    await waitFor(() => {
      expect(screen.getByText(`${newPropValue} ${newData}`)).toBeInTheDocument()
    })
    expect(
      screen.queryByText(`${newPropValue} ${data}`),
    ).not.toBeInTheDocument()
  })

  it('Does not query the API when prop did not update', async () => {
    harness.getter.mockReturnValueOnce(Promise.resolve(data))
    const { rerender } = renderWithData(harness)
    await screen.findByText(RegExp(propValue))

    harness.InnerComponent.mockClear()
    harness.getter.mockClear()
    rerenderView(rerender, propValue)

    expect(harness.getter).not.toHaveBeenCalled()
    expect(screen.getByText(`${propValue} ${data}`)).toBeInTheDocument()
  })
})

describe('On failed request', () => {
  it('Does not render wrapped component', async () => {
    harness.getter.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)),
    )
    renderWithData(harness)
    await screen.findByText(errorMessage)
    expect(harness.InnerComponent).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Aborts the request signal', () => {
    let requestSignal: AbortSignal | undefined
    harness.getter.mockImplementationOnce((_props, signal) => {
      requestSignal = signal
      return new Promise(_.noop)
    })
    const { unmount } = renderWithData(harness)
    unmount()
    expect(requestSignal?.aborted).toBe(true)
  })

  it('Does not show error', () => {
    const promise: Promise<string> = new Promise(_.noop)
    harness.getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData(harness)
    unmount()
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
  })

  it('Does not render wrapped component', () => {
    const promise: Promise<string> = new Promise(_.noop)
    harness.getter.mockReturnValueOnce(promise)
    const { unmount } = renderWithData(harness)
    unmount()
    expect(harness.InnerComponent).not.toHaveBeenCalled()
  })
})
