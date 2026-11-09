import type {
  MediaResource,
  MediaType,
  MediaReference,
} from 'fragmentarium/domain/media'

export interface MediaUploadMetadata {
  type: MediaType
  caption: string
  sourceInstitution: string
  rightsStatement: string
  permissionAttested: boolean
  creator?: string
  copyrightHolder?: string
  attribution?: string
  description?: string
  references?: readonly MediaReference[]
  projects?: readonly string[]
}

export type MediaMetadata = MediaUploadMetadata

export interface MediaUploadOptions {
  signal?: AbortSignal
  onProgress?: (loaded: number, total?: number) => void
  onProcessing?: () => void
}

export default interface MediaManagementRepository {
  upload(
    fragment: string,
    file: File,
    metadata: MediaUploadMetadata,
    idempotencyKey: string,
    options?: MediaUploadOptions,
  ): Promise<MediaResource>
  update(
    fragment: string,
    id: string,
    metadata: Partial<MediaUploadMetadata>,
    signal?: AbortSignal,
  ): Promise<MediaResource>
  setPrimary(
    fragment: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<MediaResource>
  publish(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<MediaResource>
  reject(
    fragment: string,
    id: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<MediaResource>
  remove(fragment: string, id: string, signal?: AbortSignal): Promise<void>
}
