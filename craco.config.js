const path = require('path')

const isFastDev = process.env.FAST_DEV === 'true'
const sourceDirectory = path.resolve(__dirname, 'src')

module.exports = {
  ...(isFastDev ? { eslint: { enable: false } } : {}),
  jest: {
    configure: (jestConfig) => {
      jestConfig.modulePaths = Array.from(
        new Set([...(jestConfig.modulePaths || []), sourceDirectory]),
      )
      return jestConfig
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {}
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        stream: require.resolve('stream-browserify'),
      }
      webpackConfig.resolve.modules = Array.from(
        new Set([
          ...(webpackConfig.resolve.modules || ['node_modules']),
          sourceDirectory,
        ]),
      )

      if (isFastDev && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) =>
            plugin?.constructor?.name !== 'ForkTsCheckerWebpackPlugin',
        )
      }

      if (Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.map((plugin) => {
          if (plugin?.constructor?.name === 'MiniCssExtractPlugin') {
            plugin.options = {
              ...(plugin.options || {}),
              ignoreOrder: true,
            }
          }
          return plugin
        })
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
                      silenceDeprecations: ['legacy-js-api'],
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
        /Deprecation .* legacy JS API/,
      ]

      return webpackConfig
    },
  },
}
