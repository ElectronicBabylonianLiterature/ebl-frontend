import { execFileSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const root = path.resolve(__dirname, '../..')
export const fixtureDir = path.join(
  root,
  'src',
  'test-support',
  'map-generator-fixtures',
)
export const generator = path.join(
  root,
  'scripts',
  'maps',
  'build-findspot-map-assets.py',
)
export const sites = ['assur', 'kalhu', 'nippur', 'uruk'] as const
export const outputNames = [...sites, 'all'] as const

export type InventoryRecord = {
  polygonId: string
  geometryChecksum: string
  name: string
  siteId: string
  siteName: string
  areaName: string
}
export type MappingRecord = {
  findspotId: number
  polygonIds: string[]
  locationPrecision: string
  matchMethod: string
  source: string
  sourceRevision: string
}

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

export function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, JSON.stringify(value))
}

export function makeWorkDir(): string {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'findspot-generator-'),
  )
  for (const file of fs.readdirSync(fixtureDir)) {
    fs.copyFileSync(path.join(fixtureDir, file), path.join(directory, file))
  }
  return directory
}

export function runGenerator(directory: string): void {
  execFileSync(
    'python3',
    [
      generator,
      '--findspot-dir',
      directory,
      '--artifact-dir',
      directory,
      '--expectations',
      path.join(directory, 'expectations.json'),
    ],
    { stdio: 'pipe' },
  )
}

export function hashFile(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

export function outputHashes(directory: string): Record<string, string> {
  return Object.fromEntries(
    outputNames.map((name) => [
      name,
      hashFile(path.join(directory, `${name}.geojson`)),
    ]),
  )
}

export function artifactPath(
  directory: string,
  site: string,
  type: string,
): string {
  return path.join(directory, `${site}_${type}.json`)
}
