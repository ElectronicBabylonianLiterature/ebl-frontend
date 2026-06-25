import * as fs from 'node:fs'
import * as path from 'node:path'
import * as bundleSizeMetrics from './bundleSizeMetrics.mjs'

const defaultThresholdPercent = 10
const allowedBaselineSources = new Set(['repository', 'master', 'bootstrap'])

function getReportPaths() {
  const reportDirectoryPath = path.resolve(
    bundleSizeMetrics.buildDirectory,
    'bundle-size',
  )

  return {
    reportDirectoryPath,
    reportFilePath: path.resolve(
      reportDirectoryPath,
      'bundle-budget-report.json',
    ),
  }
}

function getArgumentValue(argumentName, argv = process.argv.slice(2)) {
  const argumentIndex = argv.indexOf(argumentName)

  if (argumentIndex === -1) {
    return undefined
  }

  const argumentValue = argv[argumentIndex + 1]

  if (!argumentValue || argumentValue.startsWith('--')) {
    throw new Error(`Missing value for ${argumentName}`)
  }

  return argumentValue
}

function getBaselinePath(argv = process.argv.slice(2)) {
  const baselinePath = getArgumentValue('--baseline', argv)

  if (!baselinePath) {
    return path.resolve(
      process.cwd(),
      'scripts/bundle-size/bundle-size-baseline.json',
    )
  }

  return path.resolve(process.cwd(), baselinePath)
}

function getBaselineSource(argv = process.argv.slice(2)) {
  const baselineSource = getArgumentValue('--baseline-source', argv)

  if (!baselineSource) {
    return 'repository'
  }

  if (!allowedBaselineSources.has(baselineSource)) {
    throw new Error(
      'Invalid value for --baseline-source. Expected one of: repository, master, bootstrap',
    )
  }

  return baselineSource
}

function shouldAllowBudgetExceed(argv = process.argv.slice(2)) {
  return argv.includes('--allow-budget-exceed')
}

function validatePositiveNumber(value, fieldName) {
  if (typeof value !== 'number') {
    throw new Error(`bundle-size-baseline.json ${fieldName} must be a number`)
  }

  if (value <= 0) {
    throw new Error(
      `bundle-size-baseline.json ${fieldName} must be greater than 0`,
    )
  }
}

function applyDefaultThresholdPercent(baseline) {
  return {
    thresholdPercent: defaultThresholdPercent,
    ...baseline,
  }
}

function validateBaseline(baseline) {
  validatePositiveNumber(
    baseline.initialJavaScriptBytes,
    'initialJavaScriptBytes',
  )
  validatePositiveNumber(
    baseline.initialJavaScriptGzipBytes,
    'initialJavaScriptGzipBytes',
  )

  const validatedBaseline = applyDefaultThresholdPercent(baseline)

  validatePositiveNumber(validatedBaseline.thresholdPercent, 'thresholdPercent')

  return validatedBaseline
}

function getTopAsyncJavaScriptAssets(asyncAssetSizeByPath) {
  return [...asyncAssetSizeByPath]
    .sort((leftAsset, rightAsset) => rightAsset.bytes - leftAsset.bytes)
    .slice(0, 10)
}

function createBundleBudgetThreshold(baseline) {
  return {
    allowedInitialJavaScriptBytes: Math.round(
      baseline.initialJavaScriptBytes * (1 + baseline.thresholdPercent / 100),
    ),
  }
}

function createBundleBudgetDelta(baseline, buildMetrics) {
  const initialJavaScriptBytes =
    buildMetrics.initialJavaScriptBytes - baseline.initialJavaScriptBytes
  const initialJavaScriptGzipBytes =
    buildMetrics.initialJavaScriptGzipBytes -
    baseline.initialJavaScriptGzipBytes

  return {
    initialJavaScriptBytes,
    initialJavaScriptGzipBytes,
    initialJavaScriptBytesPercent:
      (initialJavaScriptBytes / baseline.initialJavaScriptBytes) * 100,
  }
}

function createBundleBudgetReport(
  baseline,
  buildMetrics,
  { baselineSource = 'repository', enforcementMode = 'strict' } = {},
) {
  const threshold = createBundleBudgetThreshold(baseline)
  const delta = createBundleBudgetDelta(baseline, buildMetrics)

  return {
    baselineSource,
    enforcementMode,
    budgetExceeded:
      buildMetrics.initialJavaScriptBytes >
      threshold.allowedInitialJavaScriptBytes,
    baseline: {
      initialJavaScriptBytes: baseline.initialJavaScriptBytes,
      initialJavaScriptGzipBytes: baseline.initialJavaScriptGzipBytes,
      thresholdPercent: baseline.thresholdPercent,
    },
    current: {
      initialJavaScriptBytes: buildMetrics.initialJavaScriptBytes,
      initialJavaScriptGzipBytes: buildMetrics.initialJavaScriptGzipBytes,
    },
    threshold,
    delta,
    entrypointJavaScriptAssets: buildMetrics.entrypointAssetSizeByPath,
    topAsyncJavaScriptAssets: getTopAsyncJavaScriptAssets(
      buildMetrics.asyncAssetSizeByPath,
    ),
    generatedAt: new Date().toISOString(),
  }
}

function hasExceededBudget(bundleBudgetReport) {
  return bundleBudgetReport.budgetExceeded
}

function writeBundleBudgetReport(bundleBudgetReport) {
  const { reportDirectoryPath, reportFilePath } = getReportPaths()

  fs.mkdirSync(reportDirectoryPath, { recursive: true })
  fs.writeFileSync(
    reportFilePath,
    `${JSON.stringify(bundleBudgetReport, null, 2)}\n`,
  )
}

function logBundleBudgetReport(bundleBudgetReport) {
  const { reportFilePath } = getReportPaths()

  console.log('Bundle size check')
  console.log(`Baseline source: ${bundleBudgetReport.baselineSource}`)
  console.log(`Enforcement mode: ${bundleBudgetReport.enforcementMode}`)
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
  const baselineSource = getBaselineSource(argv)
  const allowBudgetExceed = shouldAllowBudgetExceed(argv)
  const baseline = validateBaseline(
    bundleSizeMetrics.readJsonFile(baselinePath),
  )
  const buildMetrics = bundleSizeMetrics.getBuildMetrics()
  const bundleBudgetReport = createBundleBudgetReport(baseline, buildMetrics, {
    baselineSource,
    enforcementMode: allowBudgetExceed ? 'bootstrap' : 'strict',
  })

  writeBundleBudgetReport(bundleBudgetReport)
  logBundleBudgetReport(bundleBudgetReport)

  if (!hasExceededBudget(bundleBudgetReport)) {
    return
  }

  const message = `Bundle size budget exceeded (baseline source: ${baselineSource})`

  if (allowBudgetExceed) {
    console.warn(message)
    return
  }

  console.error(message)
  process.exit(1)
}

export {
  createBundleBudgetReport,
  getBaselinePath,
  getBaselineSource,
  getReportPaths,
  logBundleBudgetReport,
  runBundleBudgetCheck,
  shouldAllowBudgetExceed,
  validateBaseline,
  writeBundleBudgetReport,
}
