import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  collectModuleReferences,
  findExpectedMediaArchitectureModules,
  isMediaArchitectureFile,
  isMediaArchitectureModule,
  isProductionSourceFile,
  resolveModuleSpecifier,
  toModulePath,
} from 'test-support/mediaArchitectureIsolationGuard'

function writeFixtureTree(files: readonly string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'media-guard-'))
  for (const file of files) {
    const absolutePath = path.join(root, file)
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
    fs.writeFileSync(absolutePath, 'export {}\n')
  }
  return root
}

describe('collectModuleReferences', () => {
  test('ignores dynamic imports with a non-literal specifier', () => {
    expect(collectModuleReferences('a.ts', 'import(modulePath)')).toEqual([])
  })

  test('ignores require calls with a non-literal specifier', () => {
    expect(collectModuleReferences('a.ts', 'require(modulePath)')).toEqual([])
  })

  test('ignores a malformed import with a non-literal module specifier', () => {
    expect(collectModuleReferences('a.ts', 'import x from foo')).toEqual([])
  })

  test('ignores a malformed re-export with a non-literal module specifier', () => {
    expect(collectModuleReferences('a.ts', 'export { x } from foo')).toEqual([])
  })

  test('ignores unrelated call expressions', () => {
    expect(collectModuleReferences('a.ts', 'doSomething()')).toEqual([])
    expect(collectModuleReferences('a.ts', 'doSomething("x")')).toEqual([])
  })

  test('ignores call expressions with no arguments', () => {
    expect(collectModuleReferences('a.ts', 'import()')).toEqual([])
  })

  test('parses .tsx source using JSX syntax', () => {
    const source = `
      import { normalizeMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'
      export default function Component() {
        return <div>{normalizeMediaSummary}</div>
      }
    `
    expect(collectModuleReferences('a.tsx', source)).toEqual([
      { kind: 'import', specifier: 'fragmentarium/infrastructure/mediaMapper' },
    ])
  })
})

describe('resolveModuleSpecifier', () => {
  test('passes alias specifiers through unchanged', () => {
    expect(
      resolveModuleSpecifier(
        'fragmentarium/ui/fragment/CuneiformFragment.tsx',
        'fragmentarium/domain/media',
      ),
    ).toBe('fragmentarium/domain/media')
  })

  test('resolves relative specifiers against the importing file directory', () => {
    expect(
      resolveModuleSpecifier(
        'fragmentarium/ui/fragment/CuneiformFragment.tsx',
        '../../domain/media',
      ),
    ).toBe('fragmentarium/domain/media')
  })

  test('resolves sibling relative specifiers', () => {
    expect(
      resolveModuleSpecifier('fragmentarium/domain/mediaGallery.ts', './media'),
    ).toBe('fragmentarium/domain/media')
  })
})

describe('toModulePath', () => {
  test('strips .ts and .tsx extensions', () => {
    expect(toModulePath('fragmentarium/domain/media.ts')).toBe(
      'fragmentarium/domain/media',
    )
    expect(toModulePath('fragmentarium/ui/images/Photo.tsx')).toBe(
      'fragmentarium/ui/images/Photo',
    )
  })

  test('leaves extension-free specifiers unchanged', () => {
    expect(toModulePath('fragmentarium/domain/media')).toBe(
      'fragmentarium/domain/media',
    )
  })
})

describe('isMediaArchitectureFile', () => {
  test.each([
    'fragmentarium/domain/media.ts',
    'fragmentarium/application/MediaRepository.ts',
    'fragmentarium/infrastructure/mediaUrls.ts',
    'fragmentarium/ui/media/MediaGallery.tsx',
    'fragmentarium/ui/images/MediaThumbnail.tsx',
  ])('recognises %p as a media architecture module', (relativePath) => {
    expect(isMediaArchitectureFile(relativePath)).toBe(true)
  })

  test.each([
    'fragmentarium/ui/images/Photo.tsx',
    'fragmentarium/domain/fragment.ts',
    'corpus/domain/media.ts',
    'test-support/mediaArchitectureIsolationGuard.ts',
  ])('does not recognise %p as a media architecture module', (relativePath) => {
    expect(isMediaArchitectureFile(relativePath)).toBe(false)
  })
})

describe('findExpectedMediaArchitectureModules', () => {
  test('discovers media modules anywhere under fragmentarium and ignores tests', () => {
    const root = writeFixtureTree([
      'fragmentarium/domain/media.ts',
      'fragmentarium/domain/media.test.ts',
      'fragmentarium/ui/media/MediaGallery.tsx',
      'fragmentarium/ui/images/Photo.tsx',
      'corpus/domain/mediaThing.ts',
    ])

    expect(findExpectedMediaArchitectureModules(root)).toEqual([
      'fragmentarium/domain/media',
      'fragmentarium/ui/media/MediaGallery',
    ])
  })

  test('returns nothing for a tree without media modules', () => {
    const root = writeFixtureTree(['fragmentarium/ui/images/Photo.tsx'])

    expect(findExpectedMediaArchitectureModules(root)).toEqual([])
  })
})

describe('isMediaArchitectureModule', () => {
  test('matches exact architecture module paths', () => {
    expect(isMediaArchitectureModule('fragmentarium/domain/media')).toBe(true)
  })

  test('does not treat an unrelated similarly named module as a match', () => {
    expect(isMediaArchitectureModule('fragmentarium/domain/mediaFoo')).toBe(
      false,
    )
  })

  test('does not match unrelated modules', () => {
    expect(isMediaArchitectureModule('fragmentarium/domain/fragment')).toBe(
      false,
    )
  })
})

describe('isProductionSourceFile', () => {
  test('excludes test files', () => {
    expect(isProductionSourceFile('fragmentarium/domain/media.test.ts')).toBe(
      false,
    )
  })

  test('excludes the architecture modules themselves', () => {
    expect(isProductionSourceFile('fragmentarium/domain/media.ts')).toBe(false)
  })

  test('includes ordinary production files', () => {
    expect(isProductionSourceFile('fragmentarium/ui/images/Photo.tsx')).toBe(
      true,
    )
  })
})
