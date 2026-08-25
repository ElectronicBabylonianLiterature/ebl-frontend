import { IiifMediaResource } from 'fragmentarium/domain/iiifMedia'

export const presentationVersion = '3'

export interface IiifReference {
  readonly manifestUrl: string
  readonly presentationVersion: typeof presentationVersion
}

export const IiifDiagnosticCodes = [
  'CANVAS_DROPPED',
  'UNSUPPORTED_BODY',
  'MISSING_IMAGE_SERVICE',
  'REJECTED_URL',
  'REJECTED_ORIGIN',
  'UNRESOLVED_LANGUAGE_MAP',
  'TRUNCATED_CANVASES',
  'TRUNCATED_METADATA',
] as const

export type IiifDiagnosticCode = (typeof IiifDiagnosticCodes)[number]

export interface IiifDiagnostic {
  readonly code: IiifDiagnosticCode
  readonly detail?: string
}

export interface IiifMetadataEntry {
  readonly label: string
  readonly value: string
}

export interface IiifProvider {
  readonly id?: string
  readonly label: string
  readonly homepage?: string
}

export interface IiifDocument {
  readonly manifestId: string
  readonly label?: string
  readonly summary?: string
  readonly metadata: readonly IiifMetadataEntry[]
  readonly requiredStatement?: IiifMetadataEntry
  readonly rights?: string
  readonly provider: readonly IiifProvider[]
  readonly homepage?: string
  readonly media: readonly IiifMediaResource[]
  readonly diagnostics: readonly IiifDiagnostic[]
}

export function isDegraded(document: IiifDocument): boolean {
  return document.diagnostics.length > 0
}

export function selectMediaById(
  document: IiifDocument,
  id: string,
): IiifMediaResource | undefined {
  return document.media.find((media) => media.id === id)
}

export function selectPrimaryMedia(
  document: IiifDocument,
): IiifMediaResource | undefined {
  return document.media.find((media) => media.isPrimary) ?? document.media[0]
}
