import React, { ReactNode } from 'react'
import { Route, Redirect } from 'router/compat'
import type MarkupService from 'markup/application/MarkupService'
import type { CachedMarkupService } from 'markup/application/MarkupService'
import {
  sitemapDefaults,
  type BibliographySlugs,
  type DictionarySlugs,
  type RealiaSlugs,
  type SignSlugs,
} from 'router/sitemapConfig'
import { HeadTagsService } from 'router/head'
import type SignService from 'signs/application/SignService'
import type WordService from 'dictionary/application/WordService'
import type BibliographyService from 'bibliography/application/BibliographyService'
import type AfoRegisterService from 'afo-register/application/AfoRegisterService'
import type RealiaService from 'realia/application/RealiaService'
import type SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import type FragmentService from 'fragmentarium/application/FragmentService'
import type TextService from 'corpus/application/TextService'
import type DossiersService from 'dossiers/application/DossiersService'
import Tools, { tabIds, getDisplayTitle } from 'router/Tools'
import { tabDescriptions, getEntityRoutes } from 'router/toolsRoutes.entities'

export default function ToolsRoutes({
  sitemap,
  signService,
  markupService,
  cachedMarkupService,
  wordService,
  textService,
  bibliographyService,
  afoRegisterService,
  realiaService,
  sumerianDictionaryService,
  dossiersService,
  fragmentService,
  signSlugs,
  dictionarySlugs,
  bibliographySlugs,
  realiaSlugs,
}: {
  sitemap: boolean
  signService: SignService
  markupService: MarkupService
  cachedMarkupService: CachedMarkupService
  wordService: WordService
  textService: TextService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  realiaService: RealiaService
  sumerianDictionaryService: SumerianDictionaryService
  dossiersService: DossiersService
  fragmentService: FragmentService
  signSlugs?: SignSlugs
  dictionarySlugs?: DictionarySlugs
  bibliographySlugs?: BibliographySlugs
  realiaSlugs?: RealiaSlugs
}): JSX.Element[] {
  return [
    <Redirect
      exact
      from="/tools"
      to="/tools/introduction"
      key="tools-root-redirect"
    />,
    <Redirect
      exact
      from="/tools/bibliography"
      to="/tools/references"
      key="tools-bibliography-redirect"
    />,
    <Route
      key="tools-introduction"
      path="/tools/introduction"
      exact
      render={(): ReactNode => (
        <HeadTagsService
          title="Tools - eBL"
          description="Research tools for cuneiform studies including signs search, dictionary, bibliography, date converters, king lists, and cuneiform converters."
        >
          <Tools
            markupService={markupService}
            signService={signService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            afoRegisterService={afoRegisterService}
            realiaService={realiaService}
            sumerianDictionaryService={sumerianDictionaryService}
            dossiersService={dossiersService}
            fragmentService={fragmentService}
          />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    ...tabIds.map((tabId) => (
      <Route
        key={`tools-${tabId}`}
        path={`/tools/${tabId}`}
        exact
        render={(): ReactNode => (
          <HeadTagsService
            title={`Tools: ${getDisplayTitle(tabId)} - eBL`}
            description={tabDescriptions[tabId]}
          >
            <Tools
              markupService={markupService}
              signService={signService}
              wordService={wordService}
              bibliographyService={bibliographyService}
              afoRegisterService={afoRegisterService}
              realiaService={realiaService}
              sumerianDictionaryService={sumerianDictionaryService}
              dossiersService={dossiersService}
              fragmentService={fragmentService}
              activeTab={tabId}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    ...getEntityRoutes({
      sitemap,
      signService,
      wordService,
      textService,
      bibliographyService,
      realiaService,
      sumerianDictionaryService,
      cachedMarkupService,
      fragmentService,
      signSlugs,
      dictionarySlugs,
      bibliographySlugs,
      realiaSlugs,
    }),
  ]
}
