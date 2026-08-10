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
  test('tracks a non-empty set of architecture modules that all exist on disk', () => {
    expect(mediaArchitectureModules.length).toBeGreaterThan(0)

    for (const architectureModule of mediaArchitectureModules) {
      const existsAsTs = fs.existsSync(
        path.join(sourceRoot, `${architectureModule}.ts`),
      )
      const existsAsTsx = fs.existsSync(
        path.join(sourceRoot, `${architectureModule}.tsx`),
      )
      expect(existsAsTs || existsAsTsx).toBe(true)
    }
  })

  test('lists every media architecture module discovered on disk', () => {
    expect(mediaArchitectureModules).toEqual(
      findExpectedMediaArchitectureModules(sourceRoot),
    )
  })
})

describe('media architecture isolation: real source tree', () => {
  test('keeps new media modules out of current production runtime imports', () => {
    const sourceFiles = listSourceFiles(sourceRoot).filter((filePath) =>
      isProductionSourceFile(toRelativePath(sourceRoot, filePath)),
    )
    expect(sourceFiles.length).toBeGreaterThan(0)

    for (const filePath of sourceFiles) {
      const relativePath = toRelativePath(sourceRoot, filePath)
      expect(
        findMediaArchitectureReferences(relativePath, readSource(filePath)),
      ).toEqual([])
    }
  })

  test('finds barrel-style re-export files, proving the scan is not vacuous', () => {
    const barrelFiles = listSourceFiles(sourceRoot).filter((filePath) =>
      reExportPattern.test(readSource(filePath)),
    )

    expect(barrelFiles.length).toBeGreaterThan(0)
  })

  test('keeps every production barrel from re-exporting new media modules', () => {
    const barrelFiles = listSourceFiles(sourceRoot).filter((filePath) => {
      const relativePath = toRelativePath(sourceRoot, filePath)
      return (
        isProductionSourceFile(relativePath) &&
        reExportPattern.test(readSource(filePath))
      )
    })

    for (const filePath of barrelFiles) {
      const relativePath = toRelativePath(sourceRoot, filePath)
      const reExports = findMediaArchitectureReferences(
        relativePath,
        readSource(filePath),
      ).filter((reference) => reference.kind === 'reexport')

      expect(reExports).toEqual([])
    }
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
