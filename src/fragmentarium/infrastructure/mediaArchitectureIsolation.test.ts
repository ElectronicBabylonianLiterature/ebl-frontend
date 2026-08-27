import fs from 'fs'
import path from 'path'
import {
  findExpectedMediaArchitectureModules,
  findMediaArchitectureReferences,
  isProductionSourceFile,
  listSourceFiles,
  mediaArchitectureModules,
  toRelativePath,
} from 'test-support/mediaArchitectureIsolationGuard'

const sourceRoot = path.join(process.cwd(), 'src')
const reExportPattern = /^\s*export\s+(\*|\{)/m

function readSource(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8')
}

describe('media architecture module inventory', () => {
  test('tracks a non-empty set of architecture modules', () => {
    expect(mediaArchitectureModules.length).toBeGreaterThan(0)
  })

  test('lists every media architecture module discovered on disk', () => {
    expect(mediaArchitectureModules).toEqual(
      findExpectedMediaArchitectureModules(sourceRoot),
    )
  })
})

describe('media architecture isolation: real source tree', () => {
  const sources = listSourceFiles(sourceRoot).map((filePath) => ({
    relativePath: toRelativePath(sourceRoot, filePath),
    source: readSource(filePath),
  }))

  test('keeps new media modules out of current production runtime imports', () => {
    const productionSources = sources.filter(({ relativePath }) =>
      isProductionSourceFile(relativePath),
    )
    expect(productionSources.length).toBeGreaterThan(0)

    for (const { relativePath, source } of productionSources) {
      expect(findMediaArchitectureReferences(relativePath, source)).toEqual([])
    }
  })

  test('finds barrel-style re-export files, proving the scan is not vacuous', () => {
    const barrelSources = sources.filter(({ source }) =>
      reExportPattern.test(source),
    )

    expect(barrelSources.length).toBeGreaterThan(0)
  })
})

describe('media architecture isolation: mutation fixtures', () => {
  const filePath = 'fragmentarium/ui/fragment/CuneiformFragment.tsx'

  test.each([
    [
      'static import (alias)',
      "import { normalizeMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'",
    ],
    [
      'static import (relative)',
      "import { MediaResource } from '../../domain/media'",
    ],
    ['side-effect import', "import 'fragmentarium/domain/media'"],
    [
      'mixed type/value import',
      "import { type MediaResource, isMediaType } from 'fragmentarium/domain/media'",
    ],
    [
      're-export',
      "export { normalizeMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'",
    ],
    ['wildcard re-export', "export * from 'fragmentarium/domain/media'"],
    [
      'dynamic import',
      "async function load() { return import('fragmentarium/domain/media') }",
    ],
    ['require', "const media = require('fragmentarium/domain/media')"],
  ])('flags a %s of a media architecture module', (_label, source) => {
    expect(
      findMediaArchitectureReferences(filePath, source).length,
    ).toBeGreaterThan(0)
  })

  test.each([
    [
      'type-only import',
      "import type { MediaResource } from 'fragmentarium/domain/media'",
    ],
    [
      'type-only re-export',
      "export type { MediaResource } from 'fragmentarium/domain/media'",
    ],
    [
      'a comment mentioning the module path',
      '// see fragmentarium/domain/media for reference',
    ],
    [
      'a string literal that is not import-like',
      "const modulePath = 'fragmentarium/domain/media'",
    ],
    [
      'an unrelated module',
      "import Fragment from 'fragmentarium/domain/fragment'",
    ],
  ])('does not flag %s', (_label, source) => {
    expect(findMediaArchitectureReferences(filePath, source)).toEqual([])
  })

  test('would have caught the earlier Photo/ImageViewer-style integration', () => {
    const photoSource = `
      import React from 'react'
      import { normalizeMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'

      export default function Photo() {
        return null
      }
    `

    expect(
      findMediaArchitectureReferences(
        'fragmentarium/ui/images/Photo.tsx',
        photoSource,
      ),
    ).not.toEqual([])
  })
})
