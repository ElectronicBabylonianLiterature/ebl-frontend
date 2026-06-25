import * as fs from 'node:fs'
import * as path from 'node:path'
import { getBuildMetrics } from './bundleSizeMetrics.mjs'

const baselinePath = path.resolve(
  process.cwd(),
  'scripts/bundle-size/bundle-size-baseline.json',
)

function recordBundleBaseline() {
  const buildMetrics = getBuildMetrics()

  const baseline = {
    initialJavaScriptBytes: buildMetrics.initialJavaScriptBytes,
    initialJavaScriptGzipBytes: buildMetrics.initialJavaScriptGzipBytes,
    thresholdPercent: 10,
    generatedAt: new Date().toISOString(),
    entrypointJavaScriptAssets: buildMetrics.entrypointJavaScriptAssets,
  }

  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`)
  console.log(`Wrote bundle baseline to ${baselinePath}`)
}

recordBundleBaseline()
