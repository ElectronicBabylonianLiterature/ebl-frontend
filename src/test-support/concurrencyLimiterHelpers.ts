import ConcurrencyLimiter, { QueueState } from 'common/utils/ConcurrencyLimiter'

export class InspectableConcurrencyLimiter extends ConcurrencyLimiter {
  get state(): QueueState {
    return this.queueState
  }

  acquire(signal?: AbortSignal): Promise<() => void> {
    return this.acquireSlot(signal)
  }
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

export function queueState(limiter: InspectableConcurrencyLimiter): QueueState {
  return limiter.state
}

export async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}
