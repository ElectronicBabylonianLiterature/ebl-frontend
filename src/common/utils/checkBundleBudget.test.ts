import path from 'path'
import {
  createBundleBudgetReport,
  getBaselinePath,
  getBaselineSource,
  shouldAllowBudgetExceed,
  validateBaseline,
} from '../../../scripts/bundle-size/checkBundleBudget.mjs'

describe('checkBundleBudget', () => {
  test('createBundleBudgetReport computes thresholds and deltas', () => {
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

  test('validateBaseline throws for non-positive values', () => {
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
  })
})
