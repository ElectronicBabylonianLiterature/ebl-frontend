import usePromiseEffect from './usePromiseEffect'
import React, { FunctionComponent } from 'react'
import { render } from '@testing-library/react'

test('Aborts the operation signal on unmount', async () => {
  let capturedSignal: AbortSignal | undefined
  const TestComponent: FunctionComponent = () => {
    const [run] = usePromiseEffect()
    run((signal) => {
      capturedSignal = signal
      return new Promise(() => undefined)
    })
    return <>Test</>
  }
  const { unmount } = render(<TestComponent />)
  expect(capturedSignal?.aborted).toBe(false)
  unmount()
  expect(capturedSignal?.aborted).toBe(true)
})

test('Aborts the operation signal when cancel is called', () => {
  let capturedSignal: AbortSignal | undefined
  const TestComponent: FunctionComponent = () => {
    const [run, cancel] = usePromiseEffect()
    run((signal) => {
      capturedSignal = signal
      return new Promise(() => undefined)
    })
    cancel()
    return <>Test</>
  }
  render(<TestComponent />)
  expect(capturedSignal?.aborted).toBe(true)
})

test('Aborts the previous operation when a new one starts', () => {
  const signals: AbortSignal[] = []
  const TestComponent: FunctionComponent<{ runCount: number }> = ({
    runCount,
  }) => {
    const [run] = usePromiseEffect()
    for (let index = 0; index < runCount; index += 1) {
      run((signal) => {
        signals.push(signal)
        return new Promise(() => undefined)
      })
    }
    return <>Test</>
  }
  render(<TestComponent runCount={2} />)
  expect(signals[0].aborted).toBe(true)
  expect(signals[1].aborted).toBe(false)
})

test('Does not abort a write operation on unmount', () => {
  let capturedSignal: AbortSignal | undefined
  const TestComponent: FunctionComponent = () => {
    const [, , runWrite] = usePromiseEffect()
    runWrite((signal) => {
      capturedSignal = signal
      return new Promise(() => undefined)
    })
    return <>Test</>
  }
  const { unmount } = render(<TestComponent />)
  unmount()
  expect(capturedSignal?.aborted).toBe(false)
})

test('Does not abort a write operation when cancel is called', () => {
  let capturedSignal: AbortSignal | undefined
  const TestComponent: FunctionComponent = () => {
    const [, cancel, runWrite] = usePromiseEffect()
    runWrite((signal) => {
      capturedSignal = signal
      return new Promise(() => undefined)
    })
    cancel()
    return <>Test</>
  }
  render(<TestComponent />)
  expect(capturedSignal?.aborted).toBe(false)
})

test('Aborts the previous write when a new write supersedes it', () => {
  const signals: AbortSignal[] = []
  const TestComponent: FunctionComponent<{ runCount: number }> = ({
    runCount,
  }) => {
    const [, , runWrite] = usePromiseEffect()
    for (let index = 0; index < runCount; index += 1) {
      runWrite((signal) => {
        signals.push(signal)
        return new Promise(() => undefined)
      })
    }
    return <>Test</>
  }
  render(<TestComponent runCount={2} />)
  expect(signals[0].aborted).toBe(true)
  expect(signals[1].aborted).toBe(false)
})

test('Aborting reads leaves an in-flight write untouched', () => {
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
