import { waitFor } from '@testing-library/react'

export type PendingRead = {
  signals: (AbortSignal | undefined)[]
  read: (...parameters: unknown[]) => Promise<never>
}

export function pendingRead(): PendingRead {
  const signals: (AbortSignal | undefined)[] = []
  return {
    signals,
    read: (...parameters: unknown[]): Promise<never> => {
      signals.push(
        parameters.find(
          (parameter): parameter is AbortSignal =>
            parameter instanceof AbortSignal,
        ),
      )
      return new Promise<never>(() => undefined)
    },
  }
}

export async function expectAbortedOnUnmount(
  pending: PendingRead,
  unmount: () => void,
): Promise<void> {
  await waitFor(() => expect(pending.signals).toHaveLength(1))
  const [signal] = pending.signals
  expect(signal).toBeInstanceOf(AbortSignal)
  expect(signal).toHaveProperty('aborted', false)
  unmount()
  expect(signal).toHaveProperty('aborted', true)
}
