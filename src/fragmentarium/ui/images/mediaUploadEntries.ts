import { isEqual } from 'lodash'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import { mediaMetadataFitsHeader } from 'fragmentarium/application/mediaMetadataHeader'
import mediaUploadId from 'fragmentarium/ui/images/mediaUploadId'

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

  attempted?: readonly { key: string; metadata: MediaMetadata }[]
  percent?: number
  error?: string
}
export const completed = (entry: UploadEntry): boolean =>
  ['Submitted for review', 'Published'].includes(entry.state)
export const busy = (entry: UploadEntry): boolean =>
  ['Uploading', 'Processing'].includes(entry.state)

export const metadataTooLong = (entry: UploadEntry): boolean =>
  !mediaMetadataFitsHeader(entry.metadata, entry.file.name)

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

export function sameUploadMetadata(
  first: MediaMetadata,
  second: MediaMetadata,
): boolean {
  return isEqual(
    JSON.parse(JSON.stringify(first)),
    JSON.parse(JSON.stringify(second)),
  )
}

export function withUploadMetadata(
  entry: UploadEntry,
  metadata: MediaMetadata,
  state: UploadState = entry.state,
): UploadEntry {
  if (sameUploadMetadata(entry.metadata, metadata)) return entry

  const key =
    entry.attempted?.find((sent) => sameUploadMetadata(sent.metadata, metadata))
      ?.key ?? mediaUploadId()
  return { ...entry, metadata, state, key }
}
const textFields = [
  'caption',
  'sourceInstitution',
  'rightsStatement',
  'creator',
  'copyrightHolder',
  'attribution',
  'description',
] as const
const listFields = ['references', 'projects'] as const

const defaultMediaType: MediaMetadata['type'] = 'PHOTO'

export function mergeSharedMetadata(
  own: MediaMetadata,
  shared: MediaMetadata,
): MediaMetadata {
  const merged: MediaMetadata = { ...own }
  textFields.forEach((field) => {
    const value = shared[field]
    if (value?.trim()) merged[field] = value
  })
  listFields.forEach((field) => {
    const value = shared[field]
    if (value?.length) Object.assign(merged, { [field]: value })
  })
  if (shared.permissionAttested) merged.permissionAttested = true
  if (shared.type !== defaultMediaType) merged.type = shared.type
  return merged
}

export function sharedUploadMetadata(
  entry: UploadEntry,
  metadata: MediaMetadata,
): UploadEntry {
  return completed(entry)
    ? entry
    : withUploadMetadata(entry, mergeSharedMetadata(entry.metadata, metadata))
}
