import { useEffect, useRef, useState } from 'react'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import {
  busy,
  selectUploadEntries,
  sharedUploadMetadata,
  type UploadEntry,
} from './mediaUploadEntries'
import { uploadBatch, uploadEntry } from './mediaUploadRequest'
import mediaUploadId from './mediaUploadId'

export function useMediaUploadQueue(
  fragment: string,
  services: MediaGalleryServices,
  onChanged: () => void,
) {
  const [entries, setEntries] = useState<UploadEntry[]>([])
  const [selectionError, setSelectionError] = useState('')
  const controllers = useRef(new Map<string, AbortController>())
  const batchCancelled = useRef(false)
  const cancelledEntries = useRef(new Set<string>())
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    const active = controllers.current
    return () => {
      mounted.current = false
      active.forEach((controller) => controller.abort())
    }
  }, [])
  const runtime = {
    controllers: controllers.current,
    batchCancelled,
    cancelledEntries: cancelledEntries.current,
    mounted,
  }
  const update = (id: string, changes: Partial<UploadEntry>): void => {
    if (mounted.current)
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, ...changes } : entry,
        ),
      )
  }
  const cancel = (id: string): void => {
    cancelledEntries.current.add(id)
    controllers.current.get(id)?.abort()
    update(id, { state: 'Cancelled', percent: undefined })
  }
  const upload = (entry: UploadEntry): Promise<void> =>
    uploadEntry(entry, {
      fragment,
      management: services.management,
      runtime,
      update,
      onChanged,
    })
  const select = (files: FileList | File[], shared: MediaMetadata): void => {
    const selection = selectUploadEntries(files, entries, shared)
    setSelectionError(selection.error)
    setEntries((current) => [...current, ...selection.entries])
  }
  const cancelAll = (): void => {
    batchCancelled.current = true
    controllers.current.forEach((_, id) => cancel(id))
    setEntries((current) =>
      current.map((entry) =>
        entry.state === 'Ready to upload'
          ? { ...entry, state: 'Cancelled' }
          : entry,
      ),
    )
  }
  return {
    entries,
    selectionError,
    active: entries.some(busy),
    select,
    cancel,
    cancelAll,
    upload,
    submit: () => uploadBatch(entries, runtime, upload),
    remove: (id: string) =>
      setEntries((current) => current.filter((entry) => entry.id !== id)),
    applyShared: (metadata: MediaMetadata) =>
      setEntries((current) =>
        current.map((entry) => sharedUploadMetadata(entry, metadata)),
      ),
    edit: (id: string, metadata: MediaMetadata) =>
      update(id, { metadata, key: mediaUploadId(), state: 'Ready to upload' }),
  }
}
