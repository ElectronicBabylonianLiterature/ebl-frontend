export type TerrainEncoding = 'terrarium' | 'mapbox'

export interface TerrainSourceDefinition {
  readonly id: string
  readonly label: string
  readonly tiles: readonly string[]
  readonly encoding: TerrainEncoding
  readonly tileSize: number
  readonly minZoom: number
  readonly maxZoom: number
  readonly attribution: string
  readonly licenceUrl: string
  readonly registryUrl: string
  readonly verifiedOn: string
}

export interface TerrainSourceValidationError {
  readonly field: keyof TerrainSourceDefinition
  readonly message: string
}
export const TERRAIN_ATTRIBUTION =
  'Elevation tiles hosted by the AWS Open Data terrain-tiles registry. ' +
  'Global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey; ' +
  'Europe terrain data produced using Copernicus data and information funded by ' +
  'the European Union - EU-DEM layers; Global ETOPO1 terrain data U.S. National ' +
  'Oceanic and Atmospheric Administration.'

export const TERRAIN_PRECISION_NOTE =
  'Modern elevation model. This is present-day ground elevation, not ancient ground level or excavated stratigraphy.'

const AWS_TERRAIN_TILES: TerrainSourceDefinition = {
  id: 'aws-terrain-tiles-terrarium',
  label: 'Modern elevation model',
  tiles: [
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  ],
  encoding: 'terrarium',
  tileSize: 256,
  minZoom: 0,
  maxZoom: 15,
  attribution: TERRAIN_ATTRIBUTION,
  licenceUrl:
    'https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
  registryUrl: 'https://registry.opendata.aws/terrain-tiles/',
  verifiedOn: '2026-08-05',
}

const CREDENTIAL_PLACEHOLDERS = [
  'access_token',
  'api_key',
  'apikey',
  '{key}',
  'token=',
]

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function validateTiles(
  source: TerrainSourceDefinition,
): readonly TerrainSourceValidationError[] {
  if (source.tiles.length === 0) {
    return [{ field: 'tiles', message: 'No tile template is configured.' }]
  }

  return source.tiles.flatMap((template) => {
    const probe = template
      .replace('{z}', '0')
      .replace('{x}', '0')
      .replace('{y}', '0')
    const lowercase = template.toLowerCase()

    if (!isHttps(probe)) {
      return [
        {
          field: 'tiles' as const,
          message: `Tile URL is not HTTPS: ${template}`,
        },
      ]
    }
    if (CREDENTIAL_PLACEHOLDERS.some((entry) => lowercase.includes(entry))) {
      return [
        {
          field: 'tiles' as const,
          message: `Tile URL requires a credential: ${template}`,
        },
      ]
    }
    return []
  })
}

function validateZoom(
  source: TerrainSourceDefinition,
): readonly TerrainSourceValidationError[] {
  return source.minZoom >= source.maxZoom || source.minZoom < 0
    ? [{ field: 'maxZoom' as const, message: 'Zoom range is not usable.' }]
    : []
}

export function validateTerrainSource(
  source: TerrainSourceDefinition,
): readonly TerrainSourceValidationError[] {
  return [
    ...(source.attribution.trim() === ''
      ? [{ field: 'attribution' as const, message: 'Attribution is required.' }]
      : []),
    ...(isHttps(source.licenceUrl)
      ? []
      : [
          { field: 'licenceUrl' as const, message: 'Licence URL is required.' },
        ]),
    ...validateTiles(source),
    ...validateZoom(source),
  ]
}

export function isTerrainSourceApproved(
  source: TerrainSourceDefinition,
): boolean {
  return validateTerrainSource(source).length === 0
}
export function approvedTerrainSource(
  candidate: TerrainSourceDefinition = AWS_TERRAIN_TILES,
): TerrainSourceDefinition | null {
  return isTerrainSourceApproved(candidate) ? candidate : null
}

export { AWS_TERRAIN_TILES }
