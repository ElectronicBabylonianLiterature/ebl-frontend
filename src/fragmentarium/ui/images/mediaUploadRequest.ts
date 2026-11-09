import type { MutableRefObject } from 'react'
import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import { busy, completed, type UploadEntry } from './mediaUploadEntries'

export interface UploadRuntime {
  controllers: Map<string, AbortController>
  mounted: MutableRefObject<boolean>
  batchCancelled: MutableRefObject<boolean>
  cancelledEntries: Set<string>
}
type UpdateEntry = (id: string, changes: Partial<UploadEntry>) => void
interface UploadContext {
  fragment: string
  management: MediaManagementRepository | undefined
  runtime: UploadRuntime
  update: UpdateEntry
  onChanged: () => void
}
function uploadProgress(
  total: number | undefined,
  loaded: number,
): number | undefined {
  return total && total > 0
    ? Math.min(100, Math.round((loaded * 100) / total))
    : undefined
}
function failedEntry(
  error: Error,
  controller: AbortController,
): Partial<UploadEntry> {
  return {
    state: controller.signal.aborted ? 'Cancelled' : 'Failed',
    error: controller.signal.aborted ? undefined : error.message,
    percent: undefined,
  }
}
export async function uploadEntry(
  entry: UploadEntry,
  { fragment, management, runtime, update, onChanged }: UploadContext,
): Promise<void> {
  if (!management || runtime.controllers.has(entry.id)) return
  const controller = new AbortController()
  runtime.controllers.set(entry.id, controller)
  const updateActive = (changes: Partial<UploadEntry>): void => {
    if (!controller.signal.aborted) update(entry.id, changes)
  }
  update(entry.id, {
    state: 'Uploading',
    error: undefined,
    percent: undefined,
    attempted: [
      ...(entry.attempted ?? []),
      { key: entry.key, metadata: entry.metadata },
    ],
  })
  try {
    const saved = await management.upload(
      fragment,
      entry.file,
      entry.metadata,
      entry.key,
      {
        signal: controller.signal,
        onProgress: (loaded, total) =>
          updateActive({ percent: uploadProgress(total, loaded) }),
        onProcessing: () =>
          updateActive({ state: 'Processing', percent: undefined }),
      },
    )
    if (runtime.mounted.current && !controller.signal.aborted) {
      update(entry.id, {
        state:
          saved.publicationStatus === 'PUBLISHED'
            ? 'Published'
            : 'Submitted for review',
        percent: undefined,
      })
      onChanged()
    }
  } catch (error) {
    update(entry.id, failedEntry(error as Error, controller))
    // An aborted request may already have been committed server-side. Refresh
    // the gallery of this still-mounted fragment; success is never assumed.
    if (controller.signal.aborted && runtime.mounted.current) onChanged()
  } finally {
    runtime.controllers.delete(entry.id)
  }
}
async function drainQueue(
  queue: UploadEntry[],
  runtime: UploadRuntime,
  upload: (entry: UploadEntry) => Promise<void>,
): Promise<void> {
  while (
    queue.length &&
    runtime.mounted.current &&
    !runtime.batchCancelled.current
  ) {
    const entry = queue.shift()
    if (entry && !runtime.cancelledEntries.has(entry.id)) await upload(entry)
  }
}
export async function uploadBatch(
  entries: readonly UploadEntry[],
  runtime: UploadRuntime,
  upload: (entry: UploadEntry) => Promise<void>,
): Promise<void> {
  runtime.batchCancelled.current = false
  runtime.cancelledEntries.clear()
  const queue = entries.filter((entry) => !completed(entry) && !busy(entry))
  await Promise.all([
    drainQueue(queue, runtime, upload),
    drainQueue(queue, runtime, upload),
  ])
}
