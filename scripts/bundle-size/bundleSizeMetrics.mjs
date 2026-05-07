import * as fs from 'node:fs'
import * as path from 'node:path'
import * as zlib from 'node:zlib'

const projectRoot = process.cwd()
const buildDirectory = path.resolve(projectRoot, 'build')
const assetManifestPath = path.resolve(buildDirectory, 'asset-manifest.json')

function normalizeAssetPath(assetPath) {
  return assetPath.replace(/^\//, '')
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function getEntrypointJavaScriptAssets(assetManifest) {
  if (!Array.isArray(assetManifest.entrypoints)) {
    throw new Error('asset-manifest.json is missing entrypoints')
  }

  return assetManifest.entrypoints
    .map(normalizeAssetPath)
    .filter((assetPath) => assetPath.endsWith('.js'))
}

function getJavaScriptAssets(assetManifest) {
  const filePaths = Object.values(assetManifest.files || {}).filter(
    (assetPath) => typeof assetPath === 'string',
  )

  return [...new Set(filePaths)]
    .map(normalizeAssetPath)
    .filter((assetPath) => assetPath.endsWith('.js'))
    .filter((assetPath) => !assetPath.endsWith('.js.map'))
}

function resolveBuildAssetPath(assetPath) {
  return path.resolve(buildDirectory, normalizeAssetPath(assetPath))
}

function readAssetSize(assetPath) {
  const absolutePath = resolveBuildAssetPath(assetPath)
  const fileBuffer = fs.readFileSync(absolutePath)

  return {
    assetPath,
    bytes: fileBuffer.length,
    gzipBytes: zlib.gzipSync(fileBuffer).length,
  }
}

function sumMetric(assetSizes, metricName) {
  return assetSizes.reduce(
    (total, assetSize) => total + assetSize[metricName],
    0,
  )
}

function getBuildMetrics() {
  const assetManifest = readJsonFile(assetManifestPath)
  const entrypointJavaScriptAssets =
    getEntrypointJavaScriptAssets(assetManifest)
  const entrypointAssetSizeByPath =
    entrypointJavaScriptAssets.map(readAssetSize)
  const asyncJavaScriptAssets = getJavaScriptAssets(assetManifest).filter(
    (assetPath) => !entrypointJavaScriptAssets.includes(assetPath),
  )
  const asyncAssetSizeByPath = asyncJavaScriptAssets.map(readAssetSize)

  return {
    entrypointJavaScriptAssets,
    entrypointAssetSizeByPath,
    asyncAssetSizeByPath,
    initialJavaScriptBytes: sumMetric(entrypointAssetSizeByPath, 'bytes'),
    initialJavaScriptGzipBytes: sumMetric(
      entrypointAssetSizeByPath,
      'gzipBytes',
    ),
  }
}

export {
  projectRoot,
  buildDirectory,
  assetManifestPath,
  readJsonFile,
  getBuildMetrics,
}
