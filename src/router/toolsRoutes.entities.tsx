import React, { ReactNode } from 'react'
import { Route } from 'router/compat'
import {
  BibliographySlugs,
  DictionarySlugs,
  SignSlugs,
  sitemapDefaults,
} from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import RealiaService from 'realia/application/RealiaService'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import BibliographyViewer from 'bibliography/ui/BibliographyViewer'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import SignDisplay from 'signs/ui/display/SignDisplay'
import WordEditor from 'dictionary/ui/editor/WordEditor'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import { TabId } from 'router/Tools'

export const tabDescriptions: Record<TabId, string> = {
  signs:
    'Search and explore cuneiform signs with palaeographic details at the eBL.',
  dictionary:
    'Browse the Akkadian dictionary with CDA guide words and references at the eBL.',
  references:
    'Search the comprehensive bibliography of cuneiform publications at the eBL.',
  'afo-register':
    'Search the AfO-Register for Assyriology bibliographic references at the eBL.',
  realia:
    'Search the Dictionary of Realia for material culture and historical geography at the eBL.',
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

export function getEntityRoutes({
  sitemap,
  signService,
  wordService,
  textService,
  bibliographyService,
  realiaService,
  fragmentService,
  signSlugs,
  dictionarySlugs,
  bibliographySlugs,
}: {
  sitemap: boolean
  signService: SignService
  wordService: WordService
  textService: TextService
  bibliographyService: BibliographyService
  realiaService: RealiaService
  fragmentService: FragmentService
  signSlugs?: SignSlugs
  dictionarySlugs?: DictionarySlugs
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    <Route
      key="tools-realia-display"
      path="/tools/realia/:id"
      exact
      render={({ match }): ReactNode => {
        const entryId = decodeURIComponent(match.params.id ?? '')
        return (
          <HeadTagsService
            title={`Realia: ${entryId} - eBL`}
            description="Dictionary of Realia entry at the electronic Babylonian Library (eBL)."
          >
            <RealiaDisplay realiaService={realiaService} id={entryId} />
          </HeadTagsService>
        )
      }}
    />,
    <Route
      key="tools-sign-display"
      path="/tools/signs/:id"
      exact
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="Cuneiform sign display: eBL"
          description="Detailed cuneiform sign information at the electronic Babylonian Library (eBL)."
        >
          <SignDisplay
            signService={signService}
            wordService={wordService}
            id={decodeURIComponent(match.params.id ?? '')}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: signSlugs,
      })}
    />,
    <Route
      key="tools-dictionary-editor"
      path="/tools/dictionary/:id/edit"
      exact
      render={({ match }): ReactNode => (
        <WordEditor
          wordService={wordService}
          id={decodeURIComponent(match.params.id ?? '')}
        />
      )}
    />,
    <Route
      key="tools-dictionary-display"
      path="/tools/dictionary/:id"
      exact
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="Dictionary entry: eBL"
          description="electronic Babylonian Library (eBL) dictionary entry display"
        >
          <WordDisplay
            textService={textService}
            wordService={wordService}
            fragmentService={fragmentService}
            signService={signService}
            wordId={decodeURIComponent(match.params.id ?? '')}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: dictionarySlugs,
      })}
    />,
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
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: bibliographySlugs,
      })}
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
