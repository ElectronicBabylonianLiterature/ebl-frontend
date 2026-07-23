import usePromiseEffect, { PromiseOperation } from './usePromiseEffect'
import React, { FunctionComponent } from 'react'
import { render, RenderResult } from '@testing-library/react'

type RunnerName = 'run' | 'runWrite'

const runners: RunnerName[] = ['run', 'runWrite']

type SignalCapture = {
  signals: AbortSignal[]
  operation: PromiseOperation
}

function capturePendingSignals(): SignalCapture {
  const signals: AbortSignal[] = []
  return {
    signals,
    operation: (signal) => {
      signals.push(signal)
      return new Promise(() => undefined)
    },
  }
}

function renderOperations({
  runner,
  operation,
  runCount = 1,
  cancelAfterRun = false,
  results = [],
}: {
  runner: RunnerName
  operation: PromiseOperation
  runCount?: number
  cancelAfterRun?: boolean
  results?: Promise<void>[]
}): RenderResult {
  const TestComponent: FunctionComponent = () => {
    const [run, cancel, runWrite] = usePromiseEffect()
    const start = runner === 'run' ? run : runWrite
    for (let index = 0; index < runCount; index += 1) {
      results.push(start(operation))
    }
    if (cancelAfterRun) {
      cancel()
    }
    return <>Test</>
  }
  return render(<TestComponent />)
}

describe.each(runners)('%s', (runner) => {
  it('Aborts the previous operation when a new one supersedes it', () => {
    const { signals, operation } = capturePendingSignals()
    renderOperations({ runner, operation, runCount: 2 })
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it('Leaves the operation running while it is the current one', () => {
    const { signals, operation } = capturePendingSignals()
    renderOperations({ runner, operation })
    expect(signals[0].aborted).toBe(false)
  })

  it('Resolves instead of rejecting when the operation reports an abort', async () => {
    const abortError = new DOMException('aborted', 'AbortError')
    const results: Promise<void>[] = []
    renderOperations({
      runner,
      operation: () => Promise.reject(abortError),
      results,
    })
    await expect(results[0]).resolves.toBeUndefined()
  })

  it('Resolves instead of rejecting when the signal was aborted', async () => {
    const results: Promise<void>[] = []
    renderOperations({
      runner,
      operation: (signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () =>
            reject(new Error('failed after abort')),
          )
        }),
      runCount: 2,
      results,
    })
    await expect(results[0]).resolves.toBeUndefined()
  })

  it('Rejects with the original error when the operation fails', async () => {
    const failure = new Error('network failure')
    const results: Promise<void>[] = []
    renderOperations({
      runner,
      operation: () => Promise.reject(failure),
      results,
    })
    await expect(results[0]).rejects.toBe(failure)
  })

  it('Resolves when the operation succeeds', async () => {
    const results: Promise<void>[] = []
    renderOperations({
      runner,
      operation: () => Promise.resolve('done'),
      results,
    })
    await expect(results[0]).resolves.toBeUndefined()
  })
})

it('Aborts a read operation on unmount', () => {
  const { signals, operation } = capturePendingSignals()
  const { unmount } = renderOperations({ runner: 'run', operation })
  expect(signals[0].aborted).toBe(false)
  unmount()
  expect(signals[0].aborted).toBe(true)
})

it('Aborts a read operation when cancel is called', () => {
  const { signals, operation } = capturePendingSignals()
  renderOperations({ runner: 'run', operation, cancelAfterRun: true })
  expect(signals[0].aborted).toBe(true)
})

it('Does not abort a write operation on unmount', () => {
  const { signals, operation } = capturePendingSignals()
  const { unmount } = renderOperations({ runner: 'runWrite', operation })
  unmount()
  expect(signals[0].aborted).toBe(false)
})

it('Does not abort a write operation when cancel is called', () => {
  const { signals, operation } = capturePendingSignals()
  renderOperations({ runner: 'runWrite', operation, cancelAfterRun: true })
  expect(signals[0].aborted).toBe(false)
})

it('Aborting reads leaves an in-flight write untouched', () => {
  let readSignal: AbortSignal | undefined
  let writeSignal: AbortSignal | undefined
  const TestComponent: FunctionComponent = () => {
    const [run, , runWrite] = usePromiseEffect()
    run((signal) => {
      readSignal = signal
      return new Promise(() => undefined)
    })
    runWrite((signal) => {
      writeSignal = signal
      return new Promise(() => undefined)
    })
    return <>Test</>
  }
  const { unmount } = render(<TestComponent />)
  unmount()
  expect(readSignal?.aborted).toBe(true)
  expect(writeSignal?.aborted).toBe(false)
})
