import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
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

export async function readAtCurrentRevision<Result>(
  read: RevisionRead<Result>,
  currentRevision: () => string | undefined,
  writesSettled: () => Promise<void>,
): Promise<Result> {
  const revision = currentRevision()
  try {
    return await read(revision)
  } catch (error) {
    if (!isRevisionConflict(error)) {
      throw error
    }
    await writesSettled()
    if (currentRevision() === revision) {
      throw new Error(chapterChangedMessage)
    }
    return read(currentRevision()).catch(rejectRevisionConflict)
  }
}
