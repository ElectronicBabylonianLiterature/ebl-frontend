import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { createAbortError } from 'common/utils/abortError'
import { ApiError } from 'http/ApiClient'

export type RevisionRead<Result> = (
  revision: string | undefined,
) => Promise<Result>

function isRevisionConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409
}

export function rejectRevisionConflict(error: unknown): never {
  throw isRevisionConflict(error) ? new Error(chapterChangedMessage) : error
}

async function waitForWrites(
  writesSettled: () => Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  if (signal === undefined) {
    return writesSettled()
  }
  if (signal.aborted) {
    throw createAbortError(signal)
  }
  let rejectAborted!: (error: Error) => void
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectAborted = reject
  })
  const listener = (): void => rejectAborted(createAbortError(signal))
  signal.addEventListener('abort', listener, { once: true })
  try {
    await Promise.race([writesSettled(), aborted])
  } finally {
    signal.removeEventListener('abort', listener)
  }
}

export async function readAtCurrentRevision<Result>(
  read: RevisionRead<Result>,
  currentRevision: () => string | undefined,
  writesSettled: () => Promise<void>,
  signal?: AbortSignal,
): Promise<Result> {
  const revision = currentRevision()
  try {
    return await read(revision)
  } catch (error) {
    if (!isRevisionConflict(error)) {
      throw error
    }
    await waitForWrites(writesSettled, signal)
    if (currentRevision() === revision) {
      throw new Error(chapterChangedMessage)
    }
    return read(currentRevision()).catch(rejectRevisionConflict)
  }
}

export interface RevisionTracked<Result> {
  readonly revision: string | undefined
  readonly result: Result
}

export function trackRevision<Result>(
  read: RevisionRead<Result>,
): RevisionRead<RevisionTracked<Result>> {
  return (revision) => read(revision).then((result) => ({ revision, result }))
}

export async function readAtOneRevision<Result>(
  readAll: () => Promise<readonly RevisionTracked<Result>[]>,
): Promise<Result[]> {
  const parts = await readAll()
  const isConsistent = new Set(parts.map(({ revision }) => revision)).size <= 1
  return (isConsistent ? parts : await readAll()).map(({ result }) => result)
}
