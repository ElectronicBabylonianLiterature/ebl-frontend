import React, { FunctionComponent } from 'react'
import { render, RenderResult } from '@testing-library/react'
import usePromiseEffect, {
  PromiseOperation,
  WriteOperation,
} from 'common/hooks/usePromiseEffect'

type SignalCapture = {
  signals: AbortSignal[]
  operation: PromiseOperation
}

type StalenessCapture = {
  checks: (() => boolean)[]
  operation: WriteOperation
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

function capturePendingWrites(): StalenessCapture {
  const checks: (() => boolean)[] = []
  return {
    checks,
    operation: (isStale) => {
      checks.push(isStale)
      return new Promise(() => undefined)
    },
  }
}

type PromiseEffect = ReturnType<typeof usePromiseEffect>

type SelectRunner<Operation> = (
  effect: PromiseEffect,
) => (operation: Operation) => Promise<void>

interface RunOptions<Operation> {
  operation: Operation
  runCount?: number
  cancelAfterRun?: boolean
  results?: Promise<void>[]
}

function renderRuns<Operation>({
  select,
  operation,
  runCount = 1,
  cancelAfterRun = false,
  results = [],
}: RunOptions<Operation> & {
  select: SelectRunner<Operation>
}): RenderResult {
  const TestComponent: FunctionComponent = () => {
    const effect = usePromiseEffect()
    const run = select(effect)
    for (let index = 0; index < runCount; index += 1) {
      results.push(run(operation))
    }
    if (cancelAfterRun) {
      effect[1]()
    }
    return <>Test</>
  }
  return render(<TestComponent />)
}

function renderReads(options: RunOptions<PromiseOperation>): RenderResult {
  return renderRuns({ ...options, select: ([run]) => run })
}

function renderWrites(options: RunOptions<WriteOperation>): RenderResult {
  return renderRuns({ ...options, select: ([, , runWrite]) => runWrite })
}

describe('run', () => {
  it('Aborts the previous read when a new one supersedes it', () => {
    const { signals, operation } = capturePendingSignals()
    renderReads({ operation, runCount: 2 })
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it('Leaves the read running while it is the current one', () => {
    const { signals, operation } = capturePendingSignals()
    renderReads({ operation })
    expect(signals[0].aborted).toBe(false)
  })

  it('Aborts a read on unmount', () => {
    const { signals, operation } = capturePendingSignals()
    const { unmount } = renderReads({ operation })
    expect(signals[0].aborted).toBe(false)
    unmount()
    expect(signals[0].aborted).toBe(true)
  })

  it('Aborts a read when cancel is called', () => {
    const { signals, operation } = capturePendingSignals()
    renderReads({ operation, cancelAfterRun: true })
    expect(signals[0].aborted).toBe(true)
  })

  it('Resolves instead of rejecting when the read reports an abort', async () => {
    const results: Promise<void>[] = []
    renderReads({
      operation: () =>
        Promise.reject(new DOMException('aborted', 'AbortError')),
      results,
    })
    await expect(results[0]).resolves.toBeUndefined()
  })

  it('Resolves instead of rejecting when the read signal was aborted', async () => {
    const results: Promise<void>[] = []
    renderReads({
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

  it('Rejects with the original error when the read fails', async () => {
    const failure = new Error('network failure')
    const results: Promise<void>[] = []
    renderReads({ operation: () => Promise.reject(failure), results })
    await expect(results[0]).rejects.toBe(failure)
  })

  it('Resolves when the read succeeds', async () => {
    const results: Promise<void>[] = []
    renderReads({ operation: () => Promise.resolve('done'), results })
    await expect(results[0]).resolves.toBeUndefined()
  })
})

describe('runWrite', () => {
  it('Marks the previous write stale when a new one supersedes it', () => {
    const { checks, operation } = capturePendingWrites()
    renderWrites({ operation, runCount: 2 })
    expect(checks[0]()).toBe(true)
    expect(checks[1]()).toBe(false)
  })

  it('Leaves the write current while it is the latest one', () => {
    const { checks, operation } = capturePendingWrites()
    renderWrites({ operation })
    expect(checks[0]()).toBe(false)
  })

  it('Does not make a write stale on unmount', () => {
    const { checks, operation } = capturePendingWrites()
    const { unmount } = renderWrites({ operation })
    unmount()
    expect(checks[0]()).toBe(false)
  })

  it('Does not make a write stale when cancel is called', () => {
    const { checks, operation } = capturePendingWrites()
    renderWrites({ operation, cancelAfterRun: true })
    expect(checks[0]()).toBe(false)
  })

  it('Gives the write a staleness check rather than an abort signal', () => {
    const { checks, operation } = capturePendingWrites()
    renderWrites({ operation })
    expect(typeof checks[0]).toBe('function')
    expect(checks[0]).not.toHaveProperty('aborted')
  })

  it('Rejects with the original error when the write fails', async () => {
    const failure = new Error('network failure')
    const results: Promise<void>[] = []
    renderWrites({ operation: () => Promise.reject(failure), results })
    await expect(results[0]).rejects.toBe(failure)
  })

  it('Resolves when the write succeeds', async () => {
    const results: Promise<void>[] = []
    renderWrites({ operation: () => Promise.resolve('done'), results })
    await expect(results[0]).resolves.toBeUndefined()
  })
})

it('Aborting reads leaves an in-flight write current', () => {
  let readSignal: AbortSignal | undefined
  let isWriteStale: (() => boolean) | undefined
  const TestComponent: FunctionComponent = () => {
    const [run, , runWrite] = usePromiseEffect()
    run((signal) => {
      readSignal = signal
      return new Promise(() => undefined)
    })
    runWrite((isStale) => {
      isWriteStale = isStale
      return new Promise(() => undefined)
    })
    return <>Test</>
  }
  const { unmount } = render(<TestComponent />)
  unmount()
  expect(readSignal?.aborted).toBe(true)
  expect(isWriteStale?.()).toBe(false)
})
