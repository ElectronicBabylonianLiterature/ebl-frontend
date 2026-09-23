const isFastDev = process.env.FAST_DEV === 'true'

const SILENCED_SASS_DEPRECATIONS = [
  'legacy-js-api',
  'import',
  'global-builtin',
  'color-functions',
]

const IGNORED_WEBPACK_WARNINGS = [
  /Failed to parse source map/,
  /Deprecation .* Sass/,
  /Deprecation .* legacy JS API/,
  /Deprecation .* @import/,
  /Deprecation .* Global built-in functions/,
  /Deprecation .* darken\(\)/,
]

function configureJest(jestConfig) {
  jestConfig.roots = [...(jestConfig.roots || []), '<rootDir>/scripts']
  jestConfig.testMatch = [
    ...(jestConfig.testMatch || []),
    '<rootDir>/scripts/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ]
  jestConfig.collectCoverageFrom = [
    ...(jestConfig.collectCoverageFrom || []),
    'scripts/sitemapUpdater.js',
    'scripts/updateSitemaps.js',
  ]
  return jestConfig
}

function addStreamFallback(webpackConfig) {
  webpackConfig.resolve = webpackConfig.resolve || {}
  webpackConfig.resolve.fallback = {
    ...(webpackConfig.resolve.fallback || {}),
    stream: require.resolve('stream-browserify'),
  }
}

function hasPluginName(plugin, pluginName) {
  return plugin?.constructor?.name === pluginName
}

function ignoreCssOrder(plugin) {
  if (hasPluginName(plugin, 'MiniCssExtractPlugin')) {
    plugin.options = {
      ...(plugin.options || {}),
      ignoreOrder: true,
    }
  }
  return plugin
}

function configurePlugins(webpackConfig) {
  if (!Array.isArray(webpackConfig.plugins)) {
    return
  }
  if (isFastDev) {
    webpackConfig.plugins = webpackConfig.plugins.filter(
      (plugin) => !hasPluginName(plugin, 'ForkTsCheckerWebpackPlugin'),
    )
  }
  webpackConfig.plugins = webpackConfig.plugins.map(ignoreCssOrder)
}

function isSourceMapPreLoader(rule) {
  return (
    rule.enforce === 'pre' &&
    typeof rule.loader === 'string' &&
    rule.loader.includes('source-map-loader')
  )
}

function appendNodeModulesExclusion(existingExclude) {
  if (!existingExclude) {
    return /node_modules/
  }
  return Array.isArray(existingExclude)
    ? [...existingExclude, /node_modules/]
    : [existingExclude, /node_modules/]
}

function isSassLoader(loaderEntry) {
  return (
    Boolean(loaderEntry) &&
    typeof loaderEntry === 'object' &&
    typeof loaderEntry.loader === 'string' &&
    loaderEntry.loader.includes('sass-loader')
  )
}

function silenceSassDeprecations(loaderEntry) {
  loaderEntry.options = loaderEntry.options || {}
  loaderEntry.options.sassOptions = {
    ...(loaderEntry.options.sassOptions || {}),
    quietDeps: true,
    silenceDeprecations: [...SILENCED_SASS_DEPRECATIONS],
  }
}

function configureSassLoaders(oneOfRule) {
  if (Array.isArray(oneOfRule.use)) {
    oneOfRule.use.filter(isSassLoader).forEach(silenceSassDeprecations)
  }
}

function configureRule(rule) {
  if (isSourceMapPreLoader(rule)) {
    rule.exclude = appendNodeModulesExclusion(rule.exclude)
  }
  if (Array.isArray(rule.oneOf)) {
    rule.oneOf.forEach(configureSassLoaders)
  }
}

function configureWebpack(webpackConfig) {
  addStreamFallback(webpackConfig)
  configurePlugins(webpackConfig)
  if (webpackConfig.module?.rules) {
    webpackConfig.module.rules.forEach(configureRule)
  }
  webpackConfig.ignoreWarnings = [
    ...(webpackConfig.ignoreWarnings || []),
    ...IGNORED_WEBPACK_WARNINGS,
  ]
  return webpackConfig
}

module.exports = {
  ...(isFastDev ? { eslint: { enable: false } } : {}),
  jest: {
    configure: configureJest,
  },
  webpack: {
    configure: configureWebpack,
  },
}
