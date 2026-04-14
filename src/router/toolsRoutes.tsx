import React, { ReactNode } from 'react'
import { Route, Redirect } from 'router/compat'
import MarkupService from 'markup/application/MarkupService'
import { sitemapDefaults } from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Tools, { tabIds } from 'router/Tools'
import _ from 'lodash'

export default function ToolsRoutes({
  sitemap,
  signService,
  markupService,
  wordService,
  bibliographyService,
  afoRegisterService,
  fragmentService,
}: {
  sitemap: boolean
  signService: SignService
  markupService: MarkupService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
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
            title={`Tools: ${_.capitalize(tabId).replaceAll('-', ' ')} - eBL`}
            description="This section contains the electronic Babylonian Library (eBL) tools."
          >
            <Tools
              markupService={markupService}
              signService={signService}
              wordService={wordService}
              bibliographyService={bibliographyService}
              afoRegisterService={afoRegisterService}
              fragmentService={fragmentService}
              activeTab={tabId}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    <Route
      key="ToolsNotFound"
      path="/tools/*"
      exact
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
