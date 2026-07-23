import fs from 'fs'
import path from 'path'

const sourceRoot = path.join(process.cwd(), 'src')
const mediaArchitectureModules = [
  'common/ui/ImageViewer',
  'fragmentarium/application/MediaBinaryLoader',
  'fragmentarium/application/MediaRepository',
  'fragmentarium/domain/media',
  'fragmentarium/domain/mediaGallery',
  'fragmentarium/infrastructure/mediaDtos',
  'fragmentarium/infrastructure/mediaMapper',
  'fragmentarium/infrastructure/mediaMapperValidation',
  'fragmentarium/infrastructure/mediaRepresentationMapper',
  'fragmentarium/infrastructure/mediaResourceMapper',
  'fragmentarium/infrastructure/mediaSummaryMapper',
].sort()

function normalizePath(filePath: string): string {
  return filePath.split('\\').join('/')
}

function listSourceFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name)
      return entry.isDirectory()
        ? listSourceFiles(absolutePath)
        : absolutePath.endsWith('.ts') || absolutePath.endsWith('.tsx')
          ? [absolutePath]
          : []
    })
    .sort()
}

function toRelativePath(filePath: string): string {
  return normalizePath(path.relative(sourceRoot, filePath))
}

function toModulePath(moduleSpecifier: string): string {
  return normalizePath(moduleSpecifier).replace(/\.(ts|tsx)$/, '')
}

function resolveModuleSpecifier(
  filePath: string,
  moduleSpecifier: string,
): string {
  if (!moduleSpecifier.startsWith('.')) {
    return toModulePath(moduleSpecifier)
  }

  const relativeDirectory = path.posix.dirname(toRelativePath(filePath))
  return toModulePath(
    path.posix.normalize(path.posix.join(relativeDirectory, moduleSpecifier)),
  )
}

function isMediaArchitectureFile(relativePath: string): boolean {
  const modulePath = toModulePath(relativePath)
  return mediaArchitectureModules.some(
    (architectureModule) =>
      modulePath === architectureModule ||
      modulePath.startsWith(`${architectureModule}.`),
  )
}

function isProductionSourceFile(relativePath: string): boolean {
  return (
    !relativePath.includes('.test.') && !isMediaArchitectureFile(relativePath)
  )
}

function isFragmentariumBarrelFile(relativePath: string): boolean {
  return (
    relativePath === 'fragmentarium/index.ts' ||
    relativePath === 'fragmentarium/index.tsx' ||
    new RegExp('^fragmentarium/.*/index\\.tsx?$').test(relativePath)
  )
}

function readModuleSpecifiers(
  source: string,
  pattern: RegExp,
  filePath: string,
): readonly string[] {
  return Array.from(source.matchAll(pattern), (match) =>
    resolveModuleSpecifier(filePath, match[1]),
  )
}

describe('media architecture isolation', () => {
  test('keeps new media modules out of current production runtime imports', () => {
    const sourceFiles = listSourceFiles(sourceRoot).filter((filePath) => {
      const relativePath = toRelativePath(filePath)
      return isProductionSourceFile(relativePath)
    })

    for (const filePath of sourceFiles) {
      const source = fs.readFileSync(filePath, 'utf8')
      const moduleSpecifiers = readModuleSpecifiers(
        source,
        /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
        filePath,
      )

      for (const mediaArchitectureModule of mediaArchitectureModules) {
        expect(moduleSpecifiers).not.toContain(mediaArchitectureModule)
      }
    }
  })

  test('keeps fragmentarium barrel files from re-exporting new media modules', () => {
    const barrelFiles = listSourceFiles(sourceRoot).filter((filePath) =>
      isFragmentariumBarrelFile(toRelativePath(filePath)),
    )

    for (const filePath of barrelFiles) {
      const source = fs.readFileSync(filePath, 'utf8')
      const reExportedModules = readModuleSpecifiers(
        source,
        /\bexport\s+(?:type\s+)?(?:\*|\{[\s\S]*?\})\s+from\s+['"]([^'"]+)['"]/g,
        filePath,
      )

      for (const mediaArchitectureModule of mediaArchitectureModules) {
        expect(reExportedModules).not.toContain(mediaArchitectureModule)
      }
    }
  })
})
