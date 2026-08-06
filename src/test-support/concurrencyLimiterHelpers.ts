import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'

export type QueueState = {
  activeCount: number
  waitingResolvers: unknown[]
}

export type Deferred<Value> = {
  promise: Promise<Value>
  resolve: (value: Value) => void
}

export function deferred<Value>(): Deferred<Value> {
  let resolvePromise!: (value: Value) => void
  const promise = new Promise<Value>((resolve) => {
    resolvePromise = resolve
  })

  return { promise, resolve: resolvePromise }
}

export function queueState(limiter: ConcurrencyLimiter): QueueState {
  return (limiter as unknown as { queueState: QueueState }).queueState
}

export async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}
