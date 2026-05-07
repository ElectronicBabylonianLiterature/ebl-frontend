import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  buildDirectory,
  getBuildMetrics,
  readJsonFile,
} from './bundleSizeMetrics.mjs'

const reportDirectoryPath = path.resolve(buildDirectory, 'bundle-size')
const reportFilePath = path.resolve(
  reportDirectoryPath,
  'bundle-budget-report.json',
)

function getBaselinePath(argv = process.argv.slice(2)) {
  const baselineArgumentIndex = argv.indexOf('--baseline')

  if (baselineArgumentIndex === -1) {
    return path.resolve(
      process.cwd(),
      'scripts/bundle-size/bundle-size-baseline.json',
    )
  }

  const baselinePath = argv[baselineArgumentIndex + 1]

  if (!baselinePath) {
    throw new Error('Missing value for --baseline')
  }

  return path.resolve(process.cwd(), baselinePath)
}

function validateBaseline(baseline) {
  if (typeof baseline.initialJavaScriptBytes !== 'number') {
    throw new Error(
      'bundle-size-baseline.json initialJavaScriptBytes must be a number',
    )
  }

  if (baseline.initialJavaScriptBytes <= 0) {
    throw new Error(
      'bundle-size-baseline.json initialJavaScriptBytes must be greater than 0',
    )
  }

  if (typeof baseline.initialJavaScriptGzipBytes !== 'number') {
    throw new Error(
      'bundle-size-baseline.json initialJavaScriptGzipBytes must be a number',
    )
  }

  if (baseline.initialJavaScriptGzipBytes <= 0) {
    throw new Error(
      'bundle-size-baseline.json initialJavaScriptGzipBytes must be greater than 0',
    )
  }

  if (baseline.thresholdPercent == null) {
    return {
      ...baseline,
      thresholdPercent: 10,
    }
  }

  if (typeof baseline.thresholdPercent !== 'number') {
    throw new Error(
      'bundle-size-baseline.json thresholdPercent must be a number',
    )
  }

  if (baseline.thresholdPercent <= 0) {
    throw new Error(
      'bundle-size-baseline.json thresholdPercent must be greater than 0',
    )
  }

  return baseline
}

function getTopAsyncJavaScriptAssets(asyncAssetSizeByPath) {
  return [...asyncAssetSizeByPath]
    .sort((leftAsset, rightAsset) => rightAsset.bytes - leftAsset.bytes)
    .slice(0, 10)
}

function createBundleBudgetReport(baseline, buildMetrics) {
  const allowedInitialJavaScriptBytes = Math.round(
    baseline.initialJavaScriptBytes * (1 + baseline.thresholdPercent / 100),
  )
  const initialJavaScriptBytesDelta =
    buildMetrics.initialJavaScriptBytes - baseline.initialJavaScriptBytes
  const initialJavaScriptGzipBytesDelta =
    buildMetrics.initialJavaScriptGzipBytes -
    baseline.initialJavaScriptGzipBytes

  return {
    baseline: {
      initialJavaScriptBytes: baseline.initialJavaScriptBytes,
      initialJavaScriptGzipBytes: baseline.initialJavaScriptGzipBytes,
      thresholdPercent: baseline.thresholdPercent,
    },
    current: {
      initialJavaScriptBytes: buildMetrics.initialJavaScriptBytes,
      initialJavaScriptGzipBytes: buildMetrics.initialJavaScriptGzipBytes,
    },
    threshold: {
      allowedInitialJavaScriptBytes,
    },
    delta: {
      initialJavaScriptBytes: initialJavaScriptBytesDelta,
      initialJavaScriptGzipBytes: initialJavaScriptGzipBytesDelta,
      initialJavaScriptBytesPercent:
        (initialJavaScriptBytesDelta / baseline.initialJavaScriptBytes) * 100,
    },
    entrypointJavaScriptAssets: buildMetrics.entrypointAssetSizeByPath,
    topAsyncJavaScriptAssets: getTopAsyncJavaScriptAssets(
      buildMetrics.asyncAssetSizeByPath,
    ),
    generatedAt: new Date().toISOString(),
  }
}

function hasExceededBudget(bundleBudgetReport) {
  return (
    bundleBudgetReport.current.initialJavaScriptBytes >
    bundleBudgetReport.threshold.allowedInitialJavaScriptBytes
  )
}

function writeBundleBudgetReport(bundleBudgetReport) {
  fs.mkdirSync(reportDirectoryPath, { recursive: true })
  fs.writeFileSync(
    reportFilePath,
    `${JSON.stringify(bundleBudgetReport, null, 2)}\n`,
  )
}

function logBundleBudgetReport(bundleBudgetReport) {
  console.log('Bundle size check')
  console.log(
    `Baseline initial JavaScript: ${bundleBudgetReport.baseline.initialJavaScriptBytes} B (${bundleBudgetReport.baseline.initialJavaScriptGzipBytes} B gzip)`,
  )
  console.log(
    `Current initial JavaScript: ${bundleBudgetReport.current.initialJavaScriptBytes} B (${bundleBudgetReport.current.initialJavaScriptGzipBytes} B gzip)`,
  )
  console.log(
    `Delta: ${bundleBudgetReport.delta.initialJavaScriptBytes} B (${bundleBudgetReport.delta.initialJavaScriptGzipBytes} B gzip)`,
  )
  console.log(
    `Change: ${bundleBudgetReport.delta.initialJavaScriptBytesPercent.toFixed(2)}%`,
  )
  console.log(
    `Threshold: ${bundleBudgetReport.threshold.allowedInitialJavaScriptBytes} B`,
  )
  console.log(`Wrote bundle budget report to ${reportFilePath}`)
}

function runBundleBudgetCheck(argv = process.argv.slice(2)) {
  const baselinePath = getBaselinePath(argv)
  const baseline = validateBaseline(readJsonFile(baselinePath))
  const buildMetrics = getBuildMetrics()
  const bundleBudgetReport = createBundleBudgetReport(baseline, buildMetrics)

  writeBundleBudgetReport(bundleBudgetReport)
  logBundleBudgetReport(bundleBudgetReport)

  if (hasExceededBudget(bundleBudgetReport)) {
    console.error('Bundle size budget exceeded')
    process.exit(1)
  }
}

export {
  getBaselinePath,
  validateBaseline,
  createBundleBudgetReport,
  runBundleBudgetCheck,
}
