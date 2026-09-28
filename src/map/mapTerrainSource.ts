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

export const TERRAIN_ATTRIBUTION = [
  'ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736;',
  'Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017;',
  'Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich;',
  'Canada terrain data contains information licensed under the Open Government Licence – Canada;',
  'Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers;',
  'Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration;',
  'Mexico terrain data source: INEGI, Continental relief, 2016;',
  'New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved);',
  'Norway terrain data © Kartverket;',
  'United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved;',
  'United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.',
].join(' ')

export const TERRAIN_PRECISION_NOTE =
  'Modern-era, mixed-source bare-earth elevation model shown with visual exaggeration. It is not ancient ground level, a current survey, measurement-grade data, or excavated stratigraphy.'

const TERRAIN_TILE_URL =
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

const AWS_TERRAIN_TILES: TerrainSourceDefinition = {
  id: 'aws-terrain-tiles-terrarium',
  label: 'Modern elevation model',
  tiles: [TERRAIN_TILE_URL],
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

const CREDENTIAL_MARKERS = [
  'access_token',
  'api_key',
  'apikey',
  '{key}',
  'key=',
  'token=',
]

function isHttps(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.username === '' &&
      parsed.password === ''
    )
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
    const lowercase = template.toLowerCase()
    const probe = template
      .replace('{z}', '0')
      .replace('{x}', '0')
      .replace('{y}', '0')
    if (!['{z}', '{x}', '{y}'].every((token) => template.includes(token))) {
      return [
        {
          field: 'tiles' as const,
          message: `Tile URL is missing z/x/y placeholders: ${template}`,
        },
      ]
    }
    if (!isHttps(probe)) {
      return [
        {
          field: 'tiles' as const,
          message: `Tile URL is not credential-free HTTPS: ${template}`,
        },
      ]
    }
    if (CREDENTIAL_MARKERS.some((entry) => lowercase.includes(entry))) {
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

export function validateTerrainSource(
  source: TerrainSourceDefinition,
): readonly TerrainSourceValidationError[] {
  return [
    ...(source.attribution.trim() === ''
      ? [{ field: 'attribution' as const, message: 'Attribution is required.' }]
      : []),
    ...(isHttps(source.licenceUrl) && isHttps(source.registryUrl)
      ? []
      : [
          {
            field: 'licenceUrl' as const,
            message: 'HTTPS rights and registry URLs are required.',
          },
        ]),
    ...(source.encoding === 'terrarium' || source.encoding === 'mapbox'
      ? []
      : [
          {
            field: 'encoding' as const,
            message: 'Terrain encoding is unsupported.',
          },
        ]),
    ...(source.tileSize === 256 || source.tileSize === 512
      ? []
      : [
          {
            field: 'tileSize' as const,
            message: 'Terrain tile size is unsupported.',
          },
        ]),
    ...validateTiles(source),
    ...(source.minZoom >= source.maxZoom || source.minZoom < 0
      ? [{ field: 'maxZoom' as const, message: 'Zoom range is not usable.' }]
      : []),
  ]
}

function matchesCuratedSource(source: TerrainSourceDefinition): boolean {
  return (
    source.id === AWS_TERRAIN_TILES.id &&
    source.tiles.length === 1 &&
    source.tiles[0] === TERRAIN_TILE_URL &&
    source.encoding === AWS_TERRAIN_TILES.encoding &&
    source.tileSize === AWS_TERRAIN_TILES.tileSize &&
    source.minZoom === AWS_TERRAIN_TILES.minZoom &&
    source.maxZoom === AWS_TERRAIN_TILES.maxZoom &&
    source.label === AWS_TERRAIN_TILES.label &&
    source.verifiedOn === AWS_TERRAIN_TILES.verifiedOn &&
    source.attribution === TERRAIN_ATTRIBUTION &&
    source.licenceUrl === AWS_TERRAIN_TILES.licenceUrl &&
    source.registryUrl === AWS_TERRAIN_TILES.registryUrl
  )
}

export function isTerrainSourceApproved(
  source: TerrainSourceDefinition,
): boolean {
  return (
    matchesCuratedSource(source) && validateTerrainSource(source).length === 0
  )
}

export function approvedTerrainSource(
  candidate: TerrainSourceDefinition = AWS_TERRAIN_TILES,
): TerrainSourceDefinition | null {
  return isTerrainSourceApproved(candidate) ? candidate : null
}

export { AWS_TERRAIN_TILES }
