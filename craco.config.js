const fs = require('fs')
const path = require('path')

const isFastDev = process.env.FAST_DEV === 'true'
const sourceDirectory = path.resolve(__dirname, 'src')

const fullyCoveredPaths = [
  'src/afo-register/ui/AfoRegisterSearchFields.tsx',
  'src/auth/InjectedAuth0Provider.tsx',
  'src/bibliography/application/BibliographyEntryLoader.ts',
  'src/bibliography/ui/BibliographyEntryForm.tsx',
  'src/bibliography/ui/BibliographyEntryFormController.tsx',
  'src/chronology/application/DateSelection.tsx',
  'src/chronology/application/DateSelectionMethods.ts',
  'src/chronology/application/DateSelectionState.ts',
  'src/chronology/domain/modernDateParts.ts',
  'src/chronology/ui/DateConverter/dateConverterFieldEdges.ts',
  'src/chronology/ui/DateConverter/dateConverterOptionElements.tsx',
  'src/chronology/ui/DateEditor/DatesInTextSelection.tsx',
  'src/common/hooks/usePromiseEffect.ts',
  'src/common/utils/AbortableOperation.ts',
  'src/common/utils/abortError.ts',
  'src/common/utils/applyWhenCurrent.ts',
  'src/common/utils/captureStackTrace.ts',
  'src/common/utils/ConcurrencyLimiter.ts',
  'src/common/utils/getOrFetchCachedValue.ts',
  'src/common/utils/mapSeries.ts',
  'src/common/utils/SerialQueue.ts',
  'src/common/utils/SupersedableOperation.ts',
  'src/corpus/application/chapterDtoSerialization.ts',
  'src/corpus/application/chapterUrls.ts',
  'src/corpus/application/CorpusLemmatizationFactory.ts',
  'src/corpus/application/TextReadService.ts',
  'src/corpus/application/TextServiceBase.ts',
  'src/corpus/application/textServiceConstants.ts',
  'src/corpus/application/TextServiceCore.ts',
  'src/corpus/domain/chapterDisplay.ts',
  'src/corpus/domain/manuscript-line.ts',
  'src/corpus/ui/ChapterEditView.tsx',
  'src/corpus/ui/ChapterViewLineParts.tsx',
  'src/corpus/ui/ChapterViewLineToggles.tsx',
  'src/corpus/ui/ChapterViewLineVariant.tsx',
  'src/corpus/ui/ChapterViewVariantTransliteration.tsx',
  'src/corpus/ui/import/ChapterImport.tsx',
  'src/corpus/ui/lines/LineVariantForm.tsx',
  'src/corpus/ui/ManuscriptsTable.tsx',
  'src/corpus/ui/manuscriptTableCells.tsx',
  'src/dictionary/ui/display/WordDisplayLogograms.tsx',
  'src/dictionary/ui/editor/WordEditor.tsx',
  'src/dossiers/application/DossierCache.ts',
  'src/dossiers/application/DossiersQueryByIdsBatcher.ts',
  'src/dossiers/infrastructure/DossiersRepository.ts',
  'src/fragmentarium/application/fragmentPrefetch.ts',
  'src/fragmentarium/infrastructure/fragmentRepositoryInfo.ts',
  'src/fragmentarium/ui/edition/beforeUnloadWarning.ts',
  'src/fragmentarium/ui/edition/TransliterationForm.tsx',
  'src/fragmentarium/ui/fragment/ArchaeologyEditorFields.tsx',
  'src/fragmentarium/ui/fragment/colophonNameSuggestions.ts',
  'src/fragmentarium/ui/fragment/CuneiformFragment.tsx',
  'src/fragmentarium/ui/fragment/editorTabContents.tsx',
  'src/fragmentarium/ui/fragment/PdfExport.columns.ts',
  'src/fragmentarium/ui/fragment/PdfExport.footnotes.ts',
  'src/fragmentarium/ui/fragment/PdfExport.glossary.tsx',
  'src/fragmentarium/ui/fragment/PdfExport.headline.ts',
  'src/fragmentarium/ui/fragment/PdfExport.layout.ts',
  'src/fragmentarium/ui/fragment/PdfExport.table.ts',
  'src/fragmentarium/ui/fragment/PdfExport.tableRow.ts',
  'src/fragmentarium/ui/fragment/useFragmentSaves.ts',
  'src/fragmentarium/ui/image-annotation/annotation-tool/annotationSelection.ts',
  'src/fragmentarium/ui/image-annotation/annotation-tool/Content.tsx',
  'src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx',
  'src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotationToolbar.tsx',
  'src/fragmentarium/ui/image-annotation/annotation-tool/initializeAnnotations.ts',
  'src/fragmentarium/ui/image-annotation/annotation-tool/useAnnotationKeyboardShortcuts.ts',
  'src/fragmentarium/ui/image-annotation/annotation-tool/useAnnotationPersistence.ts',
  'src/fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState.ts',
  'src/fragmentarium/ui/image-annotation/Annotator.tsx',
  'src/fragmentarium/ui/images/Images.tsx',
  'src/fragmentarium/ui/images/ImageTabController.ts',
  'src/fragmentarium/ui/info/DetailsFields.tsx',
  'src/fragmentarium/ui/info/recordCredit.tsx',
  'src/fragmentarium/ui/info/ScriptSelection.tsx',
  'src/fragmentarium/ui/search/SearchFormAdvanced.tsx',
  'src/fragmentarium/ui/search/SearchFormPeriod.tsx',
  'src/fragmentarium/ui/SearchForm.state.ts',
  'src/fragmentarium/ui/text-annotation/SpanAnnotationDisplay.tsx',
  'src/http/ApiClient.ts',
  'src/http/withData.tsx',
  'src/IntroductionNews.tsx',
  'src/markup/application/MarkupService.ts',
  'src/markup/ui/markup.tsx',
  'src/research-projects/subpages/IntroductionHome.tsx',
  'src/signs/application/SignService.ts',
  'src/signs/infrastructure/SignRepository.ts',
  'src/signs/ui/CuneiformConverter/convertAtfLines.ts',
  'src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx',
  'src/signs/ui/display/loadClusterAnnotations.ts',
  'src/signs/ui/display/PeriodAccordion.tsx',
  'src/signs/ui/display/PeriodPreview.tsx',
  'src/signs/ui/display/SignImage.tsx',
  'src/signs/ui/display/signImageGrouping.ts',
  'src/signs/ui/display/SignImages.tsx',
  'src/signs/ui/display/VariantGroup.tsx',
  'src/transliteration/application/ReferenceInjector.ts',
  'src/transliteration/ui/DisplaySignTokens.tsx',
  'src/transliteration/ui/DisplayTokenParts.tsx',
]

function validateFullyCoveredPaths(paths) {
  const missing = paths.filter(
    (fullyCoveredPath) =>
      !fs.existsSync(path.resolve(__dirname, fullyCoveredPath)),
  )
  if (missing.length > 0) {
    throw new Error(
      `craco.config.js: fullyCoveredPaths lists ${missing.length} path(s) that no longer exist. ` +
        `Remove or rename them so the coverage gate cannot silently stop enforcing anything:\n  ` +
        missing.join('\n  '),
    )
  }
  const duplicates = paths.filter(
    (fullyCoveredPath, index) => paths.indexOf(fullyCoveredPath) !== index,
  )
  if (duplicates.length > 0) {
    throw new Error(
      `craco.config.js: fullyCoveredPaths contains duplicate entries:\n  ` +
        Array.from(new Set(duplicates)).join('\n  '),
    )
  }
  return paths
}

function configureResolve(webpackConfig) {
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
}

function pluginName(plugin) {
  return plugin?.constructor?.name
}

function configurePlugins(webpackConfig) {
  if (!Array.isArray(webpackConfig.plugins)) {
    return
  }
  webpackConfig.plugins = webpackConfig.plugins
    .filter(
      (plugin) =>
        !isFastDev || pluginName(plugin) !== 'ForkTsCheckerWebpackPlugin',
    )
    .map((plugin) => {
      if (pluginName(plugin) === 'MiniCssExtractPlugin') {
        plugin.options = { ...(plugin.options || {}), ignoreOrder: true }
      }
      return plugin
    })
}

function isSourceMapPreLoader(rule) {
  return (
    rule.enforce === 'pre' &&
    typeof rule.loader === 'string' &&
    rule.loader.includes('source-map-loader')
  )
}

function withNodeModulesExcluded(exclude) {
  if (!exclude) {
    return /node_modules/
  }
  return [...(Array.isArray(exclude) ? exclude : [exclude]), /node_modules/]
}

function isSassLoader(loaderEntry) {
  return (
    Boolean(loaderEntry) &&
    typeof loaderEntry === 'object' &&
    typeof loaderEntry.loader === 'string' &&
    loaderEntry.loader.includes('sass-loader')
  )
}

function quietSassLoader(loaderEntry) {
  loaderEntry.options = loaderEntry.options || {}
  loaderEntry.options.sassOptions = {
    ...(loaderEntry.options.sassOptions || {}),
    quietDeps: true,
    silenceDeprecations: ['legacy-js-api'],
  }
}

function configureRule(rule) {
  if (isSourceMapPreLoader(rule)) {
    rule.exclude = withNodeModulesExcluded(rule.exclude)
  }
  ;(Array.isArray(rule.oneOf) ? rule.oneOf : [])
    .flatMap((oneOfRule) => (Array.isArray(oneOfRule.use) ? oneOfRule.use : []))
    .filter(isSassLoader)
    .forEach(quietSassLoader)
}

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
      jestConfig.coverageThreshold = validateFullyCoveredPaths(
        fullyCoveredPaths,
      ).reduce(
        (thresholds, fullyCoveredPath) => ({
          ...thresholds,
          [fullyCoveredPath]: fullCoverage,
        }),
        {
          global: {
            statements: 94,
            branches: 86,
            functions: 94,
            lines: 94,
          },
        },
      )
      return jestConfig
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      configureResolve(webpackConfig)
      configurePlugins(webpackConfig)
      ;(webpackConfig.module?.rules || []).forEach(configureRule)
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
        /Deprecation .* legacy JS API/,
      ]
      return webpackConfig
    },
  },
}
