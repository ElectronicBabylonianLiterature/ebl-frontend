const path = require('path')

const isFastDev = process.env.FAST_DEV === 'true'
const sourceDirectory = path.resolve(__dirname, 'src')

const fullyCoveredPaths = [
  'src/afo-register/ui/AfoRegisterSearchFields.tsx',
  'src/bibliography/application/BibliographyEntryLoader.ts',
  'src/bibliography/ui/BibliographyEntryForm.tsx',
  'src/common/hooks/usePromiseEffect.ts',
  'src/common/utils/AbortableOperation.ts',
  'src/common/utils/ConcurrencyLimiter.ts',
  'src/common/utils/SupersedableOperation.ts',
  'src/common/utils/abortError.ts',
  'src/common/utils/applyWhenCurrent.ts',
  'src/common/utils/captureStackTrace.ts',
  'src/common/utils/getOrFetchCachedValue.ts',
  'src/common/utils/mapSeries.ts',
  'src/corpus/application/CorpusLemmatizationFactory.ts',
  'src/corpus/application/TextReadService.ts',
  'src/corpus/application/TextServiceBase.ts',
  'src/corpus/application/TextServiceCore.ts',
  'src/corpus/application/chapterUrls.ts',
  'src/corpus/application/textServiceConstants.ts',
  'src/corpus/ui/ManuscriptsTable.tsx',
  'src/corpus/ui/manuscriptTableCells.tsx',
  'src/dossiers/application/DossierCache.ts',
  'src/dossiers/application/DossiersQueryByIdsBatcher.ts',
  'src/fragmentarium/ui/fragment/ArchaeologyEditorFields.tsx',
  'src/fragmentarium/ui/fragment/colophonNameSuggestions.ts',
  'src/fragmentarium/ui/info/DetailsFields.tsx',
  'src/fragmentarium/ui/text-annotation/SpanAnnotationDisplay.tsx',
  'src/http/ApiClient.ts',
  'src/http/withData.tsx',
  'src/signs/ui/display/PeriodAccordion.tsx',
  'src/signs/ui/display/PeriodPreview.tsx',
  'src/signs/ui/display/SignImage.tsx',
  'src/signs/ui/display/SignImages.tsx',
  'src/signs/ui/display/VariantGroup.tsx',
  'src/signs/ui/display/loadClusterAnnotations.ts',
  'src/signs/ui/display/signImageGrouping.ts',
]

module.exports = {
  ...(isFastDev ? { eslint: { enable: false } } : {}),
  jest: {
    configure: (jestConfig) => {
      jestConfig.modulePaths = Array.from(
        new Set([...(jestConfig.modulePaths || []), sourceDirectory]),
      )
      const fullCoverage = {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      }
      jestConfig.coverageThreshold = fullyCoveredPaths.reduce(
        (thresholds, fullyCoveredPath) => ({
          ...thresholds,
          [fullyCoveredPath]: fullCoverage,
        }),
        {
          global: {
            statements: 93,
            branches: 84,
            functions: 93,
            lines: 93,
          },
        },
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
