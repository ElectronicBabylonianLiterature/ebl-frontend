import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import mediaUploadId from './mediaUploadId'

export type UploadState =
  | 'Ready to upload'
  | 'Uploading'
  | 'Processing'
  | 'Submitted for review'
  | 'Published'
  | 'Failed'
  | 'Cancelled'
export interface UploadEntry {
  id: string
  key: string
  file: File
  metadata: MediaMetadata
  state: UploadState
  percent?: number
  error?: string
}
export const completed = (entry: UploadEntry): boolean =>
  ['Submitted for review', 'Published'].includes(entry.state)
export const busy = (entry: UploadEntry): boolean =>
  ['Uploading', 'Processing'].includes(entry.state)

function sameFile(entry: UploadEntry, file: File): boolean {
  return (
    entry.file.name === file.name &&
    entry.file.size === file.size &&
    entry.file.lastModified === file.lastModified
  )
}
function validFile(file: File): boolean {
  const formatSupported = ['image/jpeg', 'image/png', 'image/webp'].includes(
    file.type,
  )
  return formatSupported && file.size > 0 && file.size <= 25 * 1024 * 1024
}
export function selectUploadEntries(
  files: FileList | File[],
  existing: readonly UploadEntry[],
  metadata: MediaMetadata,
): { entries: UploadEntry[]; error: string } {
  const entries: UploadEntry[] = []
  const errors: string[] = []
  Array.from(files).forEach((file) => {
    if ([...existing, ...entries].some((entry) => sameFile(entry, file)))
      errors.push(`${file.name}: this file is already selected.`)
    else if (!validFile(file))
      errors.push(`${file.name}: select a JPEG, PNG or WebP image up to 25 MB.`)
    else
      entries.push({
        id: mediaUploadId(),
        key: mediaUploadId(),
        file,
        metadata: { ...metadata },
        state: 'Ready to upload',
      })
  })
  return { entries, error: errors.join(' ') }
}
export function sharedUploadMetadata(
  entry: UploadEntry,
  metadata: MediaMetadata,
): UploadEntry {
  return completed(entry)
    ? entry
    : {
        ...entry,
        metadata: {
          ...metadata,
          caption: metadata.caption || entry.metadata.caption,
        },
        key: mediaUploadId(),
      }
}
