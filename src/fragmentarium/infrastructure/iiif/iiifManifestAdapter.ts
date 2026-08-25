import {
  IiifDiagnostic,
  IiifDocument,
  IiifMetadataEntry,
} from 'fragmentarium/domain/iiifDocument'
import { IiifMediaResource } from 'fragmentarium/domain/iiifMedia'
import {
  ManifestNormalizationResult,
  ManifestValidationFailure,
} from 'fragmentarium/domain/iiifResult'
import { IiifManifestDto } from 'fragmentarium/infrastructure/iiif/iiifDtos'
import { normalizeCanvas } from 'fragmentarium/infrastructure/iiif/iiifCanvasAdapter'
import {
  normalizeHomepage,
  normalizeMetadata,
  normalizeMetadataEntry,
  normalizeProvider,
  normalizeRights,
} from 'fragmentarium/infrastructure/iiif/iiifDescriptive'
import {
  resolveLanguageMap,
  resolveLanguageMapText,
} from 'fragmentarium/infrastructure/iiif/iiifLanguageMap'
import {
  configuredIiifOrigins,
  hasResourceType,
  isAllowedOrigin,
  isRecord,
  maximumCanvases,
  normalizeAbsoluteHttpsUrl,
  normalizeStringArray,
  toArray,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const presentationContext =
  'http://iiif.io/api/presentation/3/context.json'

interface NormalizedCanvases {
  readonly media: readonly IiifMediaResource[]
  readonly diagnostics: readonly IiifDiagnostic[]
}

function invalid(
  reason: ManifestValidationFailure,
): ManifestNormalizationResult {
  return { status: 'invalid', reason }
}

function hasSupportedContext(manifest: IiifManifestDto): boolean {
  const contexts = normalizeStringArray(manifest['@context'])
  return contexts.length === 0 || contexts.includes(presentationContext)
}

function validateManifestId(
  manifest: IiifManifestDto,
  allowedOrigins: readonly string[],
): string | ManifestValidationFailure {
  const url = normalizeAbsoluteHttpsUrl(manifest.id ?? manifest['@id'])
  if (url === undefined) {
    return 'MISSING_ID'
  }
  return isAllowedOrigin(url, allowedOrigins) ? url : 'REJECTED_ORIGIN'
}

function isValidationFailure(
  value: string,
): value is ManifestValidationFailure {
  return value === 'MISSING_ID' || value === 'REJECTED_ORIGIN'
}

function normalizeCanvases(
  items: readonly unknown[],
  allowedOrigins: readonly string[],
): NormalizedCanvases {
  const media: IiifMediaResource[] = []
  const diagnostics: IiifDiagnostic[] = []
  items.forEach((item) => {
    const normalized = normalizeCanvas(item, media.length, allowedOrigins)
    diagnostics.push(...normalized.diagnostics)
    if (normalized.media !== undefined) {
      media.push(normalized.media)
    }
  })
  return { media, diagnostics }
}

function descriptiveProperties(
  manifest: IiifManifestDto,
): Pick<
  IiifDocument,
  | 'label'
  | 'summary'
  | 'metadata'
  | 'requiredStatement'
  | 'rights'
  | 'provider'
  | 'homepage'
> {
  const label = resolveLanguageMap(manifest.label)
  const summary = resolveLanguageMapText(manifest.summary)
  const requiredStatement: IiifMetadataEntry | undefined =
    normalizeMetadataEntry(manifest.requiredStatement)
  const rights = normalizeRights(manifest.rights)
  const homepage = normalizeHomepage(manifest.homepage)
  return {
    metadata: normalizeMetadata(manifest.metadata),
    provider: normalizeProvider(manifest.provider),
    ...(label !== undefined ? { label } : {}),
    ...(summary !== undefined ? { summary } : {}),
    ...(requiredStatement !== undefined ? { requiredStatement } : {}),
    ...(rights !== undefined ? { rights } : {}),
    ...(homepage !== undefined ? { homepage } : {}),
  }
}

export function normalizeManifest(
  value: unknown,
  allowedOrigins: readonly string[] = configuredIiifOrigins(),
): ManifestNormalizationResult {
  if (!isRecord(value)) {
    return invalid('NOT_AN_OBJECT')
  }
  if (!hasResourceType(value, 'Manifest')) {
    return invalid('WRONG_TYPE')
  }
  const manifest = value as IiifManifestDto
  if (!hasSupportedContext(manifest)) {
    return invalid('UNSUPPORTED_PRESENTATION_VERSION')
  }
  const manifestId = validateManifestId(manifest, allowedOrigins)
  if (isValidationFailure(manifestId)) {
    return invalid(manifestId)
  }
  const items = toArray(manifest.items)
  if (items.length > maximumCanvases) {
    return invalid('TOO_MANY_CANVASES')
  }
  const { media, diagnostics } = normalizeCanvases(items, allowedOrigins)
  if (media.length === 0) {
    return invalid('NO_CANVASES')
  }
  const document: IiifDocument = {
    manifestId,
    ...descriptiveProperties(manifest),
    media,
    diagnostics,
  }
  return diagnostics.length > 0
    ? { status: 'degraded', document, diagnostics }
    : { status: 'ok', document }
}
