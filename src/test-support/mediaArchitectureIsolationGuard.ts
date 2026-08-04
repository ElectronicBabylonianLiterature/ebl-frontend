import fs from 'fs'
import path from 'path'
import ts from 'typescript'

export const mediaArchitectureModules = [
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

export type ModuleReferenceKind =
  | 'import'
  | 'reexport'
  | 'dynamic-import'
  | 'require'

export interface ModuleReference {
  readonly kind: ModuleReferenceKind
  readonly specifier: string
}

function stringLiteralText(node: ts.Node | undefined): string | undefined {
  return node && ts.isStringLiteral(node) ? node.text : undefined
}

export function collectModuleReferences(
  fileName: string,
  source: string,
): readonly ModuleReference[] {
  const scriptKind = fileName.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  )
  const references: ModuleReference[] = []

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) {
      const specifier = stringLiteralText(node.moduleSpecifier)
      if (specifier) {
        references.push({ kind: 'import', specifier })
      }
    } else if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier
    ) {
      const specifier = stringLiteralText(node.moduleSpecifier)
      if (specifier) {
        references.push({ kind: 'reexport', specifier })
      }
    } else if (ts.isCallExpression(node)) {
      const specifier = stringLiteralText(node.arguments[0])
      if (specifier && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        references.push({ kind: 'dynamic-import', specifier })
      } else if (
        specifier &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'require'
      ) {
        references.push({ kind: 'require', specifier })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return references
}

export function normalizeSlashes(filePath: string): string {
  return filePath.split('\\').join('/')
}

export function toModulePath(moduleSpecifier: string): string {
  return normalizeSlashes(moduleSpecifier).replace(/\.(ts|tsx)$/, '')
}

export function resolveModuleSpecifier(
  filePath: string,
  moduleSpecifier: string,
): string {
  if (!moduleSpecifier.startsWith('.')) {
    return toModulePath(moduleSpecifier)
  }

  const relativeDirectory = path.posix.dirname(normalizeSlashes(filePath))
  return toModulePath(
    path.posix.normalize(path.posix.join(relativeDirectory, moduleSpecifier)),
  )
}

export function isMediaArchitectureModule(modulePath: string): boolean {
  return mediaArchitectureModules.some(
    (architectureModule) =>
      modulePath === architectureModule ||
      modulePath.startsWith(`${architectureModule}.`),
  )
}

export function findMediaArchitectureReferences(
  filePath: string,
  source: string,
): readonly ModuleReference[] {
  return collectModuleReferences(filePath, source)
    .map((reference) => ({
      ...reference,
      specifier: resolveModuleSpecifier(filePath, reference.specifier),
    }))
    .filter((reference) => isMediaArchitectureModule(reference.specifier))
}

export function isProductionSourceFile(relativePath: string): boolean {
  return (
    !relativePath.includes('.test.') &&
    !isMediaArchitectureModule(toModulePath(relativePath))
  )
}

export function toRelativePath(sourceRoot: string, filePath: string): string {
  return normalizeSlashes(path.relative(sourceRoot, filePath))
}

export function listSourceFiles(directory: string): string[] {
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
