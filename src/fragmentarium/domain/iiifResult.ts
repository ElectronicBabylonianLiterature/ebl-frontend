import { IiifDiagnostic, IiifDocument } from 'fragmentarium/domain/iiifDocument'
import { ImageServiceDescriptor } from 'fragmentarium/domain/mediaImageService'

export const ManifestValidationFailures = [
  'MALFORMED_JSON',
  'NOT_AN_OBJECT',
  'WRONG_TYPE',
  'UNSUPPORTED_PRESENTATION_VERSION',
  'MISSING_ID',
  'REJECTED_ORIGIN',
  'NO_CANVASES',
  'TOO_MANY_CANVASES',
  'TOO_LARGE',
] as const

export type ManifestValidationFailure =
  (typeof ManifestValidationFailures)[number]

export interface AuthorizationRequiredState {
  readonly kind: 'http-401' | 'http-403'
  readonly message: string
  readonly canRetryAfterLogin: boolean
}

export type ManifestFetchResult =
  | { readonly status: 'ok'; readonly document: IiifDocument }
  | {
      readonly status: 'degraded'
      readonly document: IiifDocument
      readonly diagnostics: readonly IiifDiagnostic[]
    }
  | {
      readonly status: 'invalid'
      readonly reason: ManifestValidationFailure
    }
  | {
      readonly status: 'unauthorized'
      readonly challenge: AuthorizationRequiredState
    }
  | { readonly status: 'not-found' }
  | { readonly status: 'network-error'; readonly retryable: true }
  | { readonly status: 'unavailable' }

export type ManifestNormalizationResult =
  | { readonly status: 'ok'; readonly document: IiifDocument }
  | {
      readonly status: 'degraded'
      readonly document: IiifDocument
      readonly diagnostics: readonly IiifDiagnostic[]
    }
  | { readonly status: 'invalid'; readonly reason: ManifestValidationFailure }

export function isUsableManifest(
  result: ManifestFetchResult,
): result is Extract<ManifestFetchResult, { document: IiifDocument }> {
  return result.status === 'ok' || result.status === 'degraded'
}

export function selectDocument(
  result: ManifestFetchResult,
): IiifDocument | undefined {
  return isUsableManifest(result) ? result.document : undefined
}

export type ImageInfoFetchResult =
  | { readonly status: 'ok'; readonly service: ImageServiceDescriptor }
  | { readonly status: 'unavailable' }
