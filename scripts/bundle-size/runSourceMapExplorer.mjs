import * as fs from 'node:fs'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'
import { buildDirectory, projectRoot } from './bundleSizeMetrics.mjs'

const sourceMapExplorerCliPath = path.resolve(
  projectRoot,
  'node_modules/source-map-explorer/bin/cli.js',
)
const reportDirectory = path.resolve(buildDirectory, 'bundle-size')
const reportPath = path.resolve(reportDirectory, 'source-map-explorer.json')

function runSourceMapExplorer() {
  fs.mkdirSync(reportDirectory, { recursive: true })

  const executionResult = spawnSync(
    process.execPath,
    [
      sourceMapExplorerCliPath,
      'build/static/js/*.js',
      '--no-border-checks',
      '--json',
      'build/bundle-size/source-map-explorer.json',
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  )

  if (executionResult.status !== 0) {
    process.exit(executionResult.status || 1)
  }

  console.log(`Wrote source map explorer report to ${reportPath}`)
}

runSourceMapExplorer()
