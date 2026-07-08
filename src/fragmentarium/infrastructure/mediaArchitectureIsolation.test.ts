import fs from 'fs'
import path from 'path'

const sourceRoot = path.join(process.cwd(), 'src')
const mediaArchitectureModules = [
  'fragmentarium/application/MediaBinaryLoader',
  'fragmentarium/application/MediaRepository',
  'fragmentarium/domain/media',
  'fragmentarium/domain/mediaGallery',
  'fragmentarium/infrastructure/mediaDtos',
  'fragmentarium/infrastructure/mediaMapper',
]

function listSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    return entry.isDirectory()
      ? listSourceFiles(absolutePath)
      : absolutePath.endsWith('.ts') || absolutePath.endsWith('.tsx')
        ? [absolutePath]
        : []
  })
}

describe('media architecture isolation', () => {
  test('keeps new media modules out of current production runtime imports', () => {
    const sourceFiles = listSourceFiles(sourceRoot).filter((filePath) => {
      const relativePath = path.relative(sourceRoot, filePath)

      return (
        !relativePath.includes('.test.') &&
        !relativePath.startsWith('fragmentarium/application/Media') &&
        !relativePath.startsWith('fragmentarium/domain/media') &&
        !relativePath.startsWith('fragmentarium/infrastructure/media')
      )
    })

    for (const filePath of sourceFiles) {
      const source = fs.readFileSync(filePath, 'utf8')

      for (const mediaArchitectureModule of mediaArchitectureModules) {
        expect(source).not.toContain(mediaArchitectureModule)
      }
    }
  })
})
