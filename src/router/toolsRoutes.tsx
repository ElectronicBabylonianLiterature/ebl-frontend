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
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyViewer from 'bibliography/ui/BibliographyViewer'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import Tools, { tabIds, TabId, getDisplayTitle } from 'router/Tools'

const tabDescriptions: Record<TabId, string> = {
  signs:
    'Search and explore cuneiform signs with palaeographic details at the eBL.',
  dictionary:
    'Browse the Akkadian dictionary with CDA guide words and references at the eBL.',
  references:
    'Search the comprehensive bibliography of cuneiform publications at the eBL.',
  'afo-register':
    'Search the AfO-Register for Assyriology bibliographic references at the eBL.',
  dossiers:
    'Browse cuneiform fragment dossiers grouped by provenance and period at the eBL.',
  genres: 'Explore the genre classification of cuneiform fragments at the eBL.',
  'date-converter':
    'Convert between Babylonian and Julian/Gregorian calendar dates at the eBL.',
  'list-of-kings':
    'Reference list of Babylonian and Assyrian kings and dynasties at the eBL.',
  'cuneiform-converter':
    'Convert text to cuneiform script representations at the eBL.',
}

export default function ToolsRoutes({
  sitemap,
  signService,
  markupService,
  wordService,
  bibliographyService,
  afoRegisterService,
  dossiersService,
  fragmentService,
}: {
  sitemap: boolean
  signService: SignService
  markupService: MarkupService
  wordService: WordService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  dossiersService: DossiersService
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
              dossiersService={dossiersService}
              fragmentService={fragmentService}
              activeTab={tabId}
            />
          </HeadTagsService>
        )}
        {...(sitemap && sitemapDefaults)}
      />
    )),
    <Route
      key="tools-bibliography-editor-new"
      path="/tools/references/new-reference"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Create Bibliography entry: eBL"
          description="Create bibliography entry in the electronic Babylonian Library (eBL)."
        >
          <BibliographyEditor
            bibliographyService={bibliographyService}
            {...props}
            create={true}
            match={{
              ...props.match,
              params: { id: '' },
            }}
          />
        </HeadTagsService>
      )}
    />,
    <Route
      key="tools-bibliography-viewer"
      path="/tools/references/:id"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Bibliography entry: eBL"
          description="Bibliography entry at the electronic Library (eBL)."
        >
          <BibliographyViewer
            bibliographyService={bibliographyService}
            {...props}
          />
        </HeadTagsService>
      )}
    />,
    <Route
      key="tools-bibliography-editor"
      path="/tools/references/:id/edit"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Edit Bibliography entry: eBL"
          description="Edit bibliography entry at the electronic Library (eBL)."
        >
          <BibliographyEditor
            bibliographyService={bibliographyService}
            {...props}
          />
        </HeadTagsService>
      )}
    />,
    <Route
      key="ToolsNotFound"
      path="/tools/*"
      exact
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
