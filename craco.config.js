const isFastDev = process.env.FAST_DEV === 'true'

module.exports = {
  ...(isFastDev ? { eslint: { enable: false } } : {}),
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {}
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        stream: require.resolve('stream-browserify'),
      }

      if (isFastDev && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin?.constructor?.name !== 'ForkTsCheckerWebpackPlugin',
        )
      }

      if (webpackConfig.module?.rules) {
        webpackConfig.module.rules.forEach((rule) => {
          if (
            rule.enforce === 'pre' &&
            typeof rule.loader === 'string' &&
            rule.loader.includes('source-map-loader')
          ) {
            const existingExclude = rule.exclude
            rule.exclude = existingExclude
              ? Array.isArray(existingExclude)
                ? [...existingExclude, /node_modules/]
                : [existingExclude, /node_modules/]
              : /node_modules/
          }

          if (Array.isArray(rule.oneOf)) {
            rule.oneOf.forEach((oneOfRule) => {
              if (Array.isArray(oneOfRule.use)) {
                oneOfRule.use.forEach((loaderEntry) => {
                  if (
                    loaderEntry &&
                    typeof loaderEntry === 'object' &&
                    typeof loaderEntry.loader === 'string' &&
                    loaderEntry.loader.includes('sass-loader')
                  ) {
                    loaderEntry.options = loaderEntry.options || {}
                    loaderEntry.options.sassOptions = {
                      ...(loaderEntry.options.sassOptions || {}),
                      quietDeps: true,
                      silenceDeprecations: [
                        'legacy-js-api',
                        'import',
                        'global-builtin',
                        'color-functions',
                      ],
                    }
                  }
                })
              }
            })
          }
        })
      }

      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
        /Deprecation .* Sass/,
        /Deprecation .* legacy JS API/,
        /Deprecation .* @import/,
        /Deprecation .* Global built-in functions/,
        /Deprecation .* darken\(\)/,
      ]

      return webpackConfig
    },
  },
}
