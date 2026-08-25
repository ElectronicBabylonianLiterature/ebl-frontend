import fs from 'fs'
import path from 'path'
import {
  collectModuleReferences,
  findExpectedMediaArchitectureModules,
  findMediaArchitectureReferences,
  iiifArchitectureModules,
  isMediaArchitectureFile,
  isMediaDomainConsumer,
  isProductionSourceFile,
  mediaArchitectureModules,
  mediaDomainConsumers,
  mediaDomainModule,
} from 'test-support/mediaArchitectureIsolationGuard'

const sourceRoot = path.join(process.cwd(), 'src')
const unexemptedFile = 'fragmentarium/ui/fragment/CuneiformFragment.tsx'

function readModule(modulePath: string): string {
  return fs.readFileSync(path.join(sourceRoot, `${modulePath}.ts`), 'utf8')
}

describe('IIIF architecture exemptions', () => {
  test('tracks a non-empty set of IIIF modules that all exist on disk', () => {
    expect(iiifArchitectureModules.length).toBeGreaterThan(0)

    for (const iiifModule of iiifArchitectureModules) {
      expect(fs.existsSync(path.join(sourceRoot, `${iiifModule}.ts`))).toBe(
        true,
      )
    }
  })

  test('keeps IIIF modules out of the media architecture inventory', () => {
    for (const iiifModule of iiifArchitectureModules) {
      expect(mediaArchitectureModules).not.toContain(iiifModule)
      expect(isMediaArchitectureFile(`${iiifModule}.ts`)).toBe(false)
    }
  })

  test('keeps IIIF modules inside the scanned production surface', () => {
    for (const iiifModule of iiifArchitectureModules) {
      expect(isProductionSourceFile(`${iiifModule}.ts`)).toBe(true)
    }
  })

  test('still discovers unexempted media-named modules on disk', () => {
    expect(findExpectedMediaArchitectureModules(sourceRoot)).toEqual(
      mediaArchitectureModules,
    )
    expect(
      isMediaArchitectureFile('fragmentarium/domain/mediaSomethingNew.ts'),
    ).toBe(true)
  })
})

describe('media domain consumer exemptions', () => {
  test('tracks a non-empty set of consumers that all exist on disk', () => {
    expect(mediaDomainConsumers.length).toBeGreaterThan(0)

    for (const consumer of mediaDomainConsumers) {
      expect(fs.existsSync(path.join(sourceRoot, `${consumer}.ts`))).toBe(true)
      expect(isMediaDomainConsumer(`${consumer}.ts`)).toBe(true)
    }
  })

  test('exempts only files that really need the media domain at runtime', () => {
    for (const consumer of mediaDomainConsumers) {
      const references = collectModuleReferences(
        `${consumer}.ts`,
        readModule(consumer),
      )
      expect(references).toContainEqual({
        kind: 'import',
        specifier: mediaDomainModule,
      })
    }
  })

  test('does not flag a consumer importing the media domain module', () => {
    for (const consumer of mediaDomainConsumers) {
      expect(
        findMediaArchitectureReferences(
          `${consumer}.ts`,
          `import { isRasterMediaMimeType } from '${mediaDomainModule}'`,
        ),
      ).toEqual([])
    }
  })

  test.each([
    'fragmentarium/infrastructure/mediaMapper',
    'fragmentarium/infrastructure/mediaUrls',
    'fragmentarium/application/MediaRepository',
    'fragmentarium/application/MediaBinaryLoader',
    'fragmentarium/domain/mediaGallery',
  ])('still flags a consumer importing %s', (forbiddenModule) => {
    for (const consumer of mediaDomainConsumers) {
      expect(
        findMediaArchitectureReferences(
          `${consumer}.ts`,
          `import { anything } from '${forbiddenModule}'`,
        ).length,
      ).toBeGreaterThan(0)
    }
  })

  test('still flags an unexempted file importing the media domain module', () => {
    expect(
      findMediaArchitectureReferences(
        unexemptedFile,
        `import { isRasterMediaMimeType } from '${mediaDomainModule}'`,
      ),
    ).toEqual([{ kind: 'import', specifier: mediaDomainModule }])
  })

  test('still flags a relative import from an unexempted sibling file', () => {
    expect(
      findMediaArchitectureReferences(
        'fragmentarium/domain/somethingElse.ts',
        "import { isRasterMediaMimeType } from './media'",
      ).length,
    ).toBeGreaterThan(0)
  })
})
