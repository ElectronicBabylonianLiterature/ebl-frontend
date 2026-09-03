export type MapResourceKind =
  | 'style'
  | 'tile'
  | 'sprite'
  | 'glyphs'
  | 'source'
  | 'unknown'

export interface MapErrorEventLike {
  readonly error?: unknown
  readonly sourceId?: string
  readonly source?: { readonly type?: string }
  readonly tile?: unknown
}

interface ResourceRequest {
  readonly url?: string
  readonly type?: string
}

interface ErrorWithRequest {
  readonly message?: unknown
  readonly status?: unknown
  readonly url?: unknown
  readonly resourceType?: unknown
  readonly request?: ResourceRequest
}

const RESOURCE_TYPE_KINDS: Readonly<Record<string, MapResourceKind>> = {
  Style: 'style',
  Tile: 'tile',
  SpriteImage: 'sprite',
  SpriteJSON: 'sprite',
  Glyphs: 'glyphs',
  Source: 'source',
}

function asErrorWithRequest(error: unknown): ErrorWithRequest {
  return error && typeof error === 'object' ? (error as ErrorWithRequest) : {}
}

function requestUrl(error: ErrorWithRequest): string {
  const url = typeof error.url === 'string' ? error.url : error.request?.url
  return typeof url === 'string' ? url : ''
}

function kindFromUrl(url: string): MapResourceKind {
  if (url.includes('/sprite')) return 'sprite'
  if (url.includes('{fontstack}') || url.includes('/fonts/')) return 'glyphs'
  if (/\.pbf|\.mvt|\{z\}|\/tiles?\//.test(url)) return 'tile'
  if (/style\.json|\/styles?\//.test(url)) return 'style'
  return 'unknown'
}

export function classifyMapResourceKind(
  event: MapErrorEventLike,
): MapResourceKind {
  const error = asErrorWithRequest(event.error)
  const resourceType =
    typeof error.resourceType === 'string'
      ? error.resourceType
      : error.request?.type

  const declaredKind =
    typeof resourceType === 'string'
      ? RESOURCE_TYPE_KINDS[resourceType]
      : undefined
  if (declaredKind) return declaredKind

  if (event.tile !== undefined) return 'tile'
  if (event.sourceId !== undefined) return 'source'

  return kindFromUrl(requestUrl(error))
}

export function isBaseStyleFailure(
  event: MapErrorEventLike,
  styleUrl: string,
): boolean {
  if (event.sourceId !== undefined || event.tile !== undefined) return false

  const error = asErrorWithRequest(event.error)
  const url = requestUrl(error)

  return (
    classifyMapResourceKind(event) === 'style' &&
    (url === '' || url === styleUrl)
  )
}
