import * as fs from 'node:fs'
import * as path from 'node:path'
import * as bundleSizeMetrics from './bundleSizeMetrics.mjs'
import {
  createBundleBudgetReport,
  getBaselinePath,
  getBaselineSource,
  getReportPaths,
  logBundleBudgetReport,
  runBundleBudgetCheck,
  shouldAllowBudgetExceed,
  validateBaseline,
  writeBundleBudgetReport,
} from './checkBundleBudget.mjs'

const baseline = {
  initialJavaScriptBytes: 1000,
  initialJavaScriptGzipBytes: 500,
  thresholdPercent: 10,
}

const buildMetrics = {
  initialJavaScriptBytes: 1080,
  initialJavaScriptGzipBytes: 560,
  entrypointAssetSizeByPath: [
    { assetPath: 'static/js/main.js', bytes: 1080, gzipBytes: 560 },
  ],
  asyncAssetSizeByPath: [
    { assetPath: 'static/js/chunk-a.js', bytes: 320, gzipBytes: 100 },
    { assetPath: 'static/js/chunk-b.js', bytes: 640, gzipBytes: 200 },
  ],
}

describe('checkBundleBudget', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  test('createBundleBudgetReport computes thresholds and deltas', () => {
    const report = createBundleBudgetReport(baseline, buildMetrics, {
      baselineSource: 'master',
      enforcementMode: 'strict',
    })

    expect(report.threshold.allowedInitialJavaScriptBytes).toBe(1100)
    expect(report.delta.initialJavaScriptBytes).toBe(80)
    expect(report.delta.initialJavaScriptGzipBytes).toBe(60)
    expect(report.delta.initialJavaScriptBytesPercent).toBeCloseTo(8, 5)
    expect(report.baselineSource).toBe('master')
    expect(report.enforcementMode).toBe('strict')
    expect(report.budgetExceeded).toBe(false)
    expect(report.topAsyncJavaScriptAssets[0].assetPath).toBe(
      'static/js/chunk-b.js',
    )
  })

  test('getBaselinePath resolves the default repository baseline path', () => {
    expect(getBaselinePath()).toBe(
      path.resolve(
        process.cwd(),
        'scripts/bundle-size/bundle-size-baseline.json',
      ),
    )
  })

  test('getBaselinePath resolves custom baseline path', () => {
    expect(
      getBaselinePath(['--baseline', 'build/bundle-size/master-baseline.json']),
    ).toBe(
      path.resolve(process.cwd(), 'build/bundle-size/master-baseline.json'),
    )
  })

  test('getBaselinePath throws for missing baseline value', () => {
    expect(() => getBaselinePath(['--baseline'])).toThrow(
      'Missing value for --baseline',
    )
  })

  test('getBaselineSource resolves custom source', () => {
    expect(getBaselineSource(['--baseline-source', 'bootstrap'])).toBe(
      'bootstrap',
    )
  })

  test('getBaselineSource throws for invalid source', () => {
    expect(() =>
      getBaselineSource(['--baseline-source', 'invalid-source']),
    ).toThrow(
      'Invalid value for --baseline-source. Expected one of: repository, master, bootstrap',
    )
  })

  test('shouldAllowBudgetExceed returns true when flag is present', () => {
    expect(shouldAllowBudgetExceed(['--allow-budget-exceed'])).toBe(true)
  })

  test('shouldAllowBudgetExceed returns false when flag is not present', () => {
    expect(shouldAllowBudgetExceed([])).toBe(false)
  })

  test('validateBaseline applies the default threshold percent', () => {
    expect(
      validateBaseline({
        initialJavaScriptBytes: 100,
        initialJavaScriptGzipBytes: 50,
      }),
    ).toEqual({
      initialJavaScriptBytes: 100,
      initialJavaScriptGzipBytes: 50,
      thresholdPercent: 10,
    })
  })

  test('validateBaseline throws for invalid values', () => {
    expect(() =>
      validateBaseline({
        initialJavaScriptBytes: 0,
        initialJavaScriptGzipBytes: 100,
      }),
    ).toThrow(
      'bundle-size-baseline.json initialJavaScriptBytes must be greater than 0',
    )

    expect(() =>
      validateBaseline({
        initialJavaScriptBytes: 100,
        initialJavaScriptGzipBytes: 0,
      }),
    ).toThrow(
      'bundle-size-baseline.json initialJavaScriptGzipBytes must be greater than 0',
    )

    expect(() =>
      validateBaseline({
        initialJavaScriptBytes: 100,
        initialJavaScriptGzipBytes: 50,
        thresholdPercent: '10',
      }),
    ).toThrow('bundle-size-baseline.json thresholdPercent must be a number')
  })

  test('writeBundleBudgetReport writes the JSON report to disk', () => {
    const report = createBundleBudgetReport(baseline, buildMetrics)
    const mkdirSync = jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementation(() => undefined)
    const writeFileSync = jest
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(() => undefined)
    const { reportDirectoryPath, reportFilePath } = getReportPaths()

    writeBundleBudgetReport(report)

    expect(mkdirSync).toHaveBeenCalledWith(reportDirectoryPath, {
      recursive: true,
    })
    expect(writeFileSync).toHaveBeenCalledWith(
      reportFilePath,
      `${JSON.stringify(report, null, 2)}\n`,
    )
  })

  test('logBundleBudgetReport writes a readable summary', () => {
    const report = createBundleBudgetReport(baseline, buildMetrics, {
      baselineSource: 'master',
      enforcementMode: 'strict',
    })

    logBundleBudgetReport(report)

    expect(console.log).toHaveBeenCalledWith('Bundle size check')
    expect(console.log).toHaveBeenCalledWith('Baseline source: master')
    expect(console.log).toHaveBeenCalledWith('Enforcement mode: strict')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Wrote bundle budget report to'),
    )
  })

  test('runBundleBudgetCheck exits when the strict budget is exceeded', () => {
    jest.spyOn(bundleSizeMetrics, 'readJsonFile').mockReturnValue(baseline)
    jest.spyOn(bundleSizeMetrics, 'getBuildMetrics').mockReturnValue({
      ...buildMetrics,
      initialJavaScriptBytes: 1200,
    })
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined)
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`)
    })

    expect(() => runBundleBudgetCheck()).toThrow('process.exit:1')
    expect(console.error).toHaveBeenCalledWith(
      'Bundle size budget exceeded (baseline source: repository)',
    )
  })

  test('runBundleBudgetCheck warns instead of exiting in bootstrap mode', () => {
    jest.spyOn(bundleSizeMetrics, 'readJsonFile').mockReturnValue(baseline)
    jest.spyOn(bundleSizeMetrics, 'getBuildMetrics').mockReturnValue({
      ...buildMetrics,
      initialJavaScriptBytes: 1200,
    })
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined)
    const processExit = jest.spyOn(process, 'exit')

    runBundleBudgetCheck(['--allow-budget-exceed'])

    expect(console.warn).toHaveBeenCalledWith(
      'Bundle size budget exceeded (baseline source: repository)',
    )
    expect(processExit).not.toHaveBeenCalled()
  })

  test('runBundleBudgetCheck completes without warnings when under budget', () => {
    jest.spyOn(bundleSizeMetrics, 'readJsonFile').mockReturnValue(baseline)
    jest
      .spyOn(bundleSizeMetrics, 'getBuildMetrics')
      .mockReturnValue(buildMetrics)
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined)
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined)
    const processExit = jest.spyOn(process, 'exit')

    runBundleBudgetCheck()

    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
    expect(processExit).not.toHaveBeenCalled()
  })
})
