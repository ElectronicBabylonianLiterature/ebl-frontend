import React, { ReactNode } from 'react'
import { Route, Redirect } from 'react-router-dom'
import Library from 'library/ui/Library'
import Signs from 'signs/ui/search/Signs'
import SignDisplay from 'signs/ui/display/SignDisplay'
import Dictionary from 'dictionary/ui/search/Dictionary'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import WordEditor from 'dictionary/ui/editor/WordEditor'
import Bibliography from 'bibliography/ui/Bibliography'
import BibliographyViewer from 'bibliography/ui/BibliographyViewer'
import BibliographyEditor from 'bibliography/ui/BibliographyEditor'
import WordService from 'dictionary/application/WordService'
import SignService from 'signs/application/SignService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import {
  SignSlugs,
  DictionarySlugs,
  BibliographySlugs,
  sitemapDefaults,
} from 'router/sitemap'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'

/**
 * LibraryRoutes consolidates the Signs, Dictionary, and Bibliography sections
 * into a unified Reference Library interface with sidebar navigation.
 *
 * This provides a more intuitive user experience by grouping related reference
 * resources together while maintaining their individual search and display functionality.
 *
 * Each section retains its specific features:
 * - Signs: Cuneiform sign search and detailed sign information
 * - Dictionary: Word search with lemma display and editing capabilities
 * - Bibliography: Reference management with AfO Register integration
 */
export default function LibraryRoutes({
  sitemap,
  wordService,
  signService,
  bibliographyService,
  afoRegisterService,
  fragmentService,
  textService,
  signSlugs,
  dictionarySlugs,
  bibliographySlugs,
}: {
  sitemap: boolean
  wordService: WordService
  signService: SignService
  bibliographyService: BibliographyService
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
  textService: TextService
  signSlugs?: SignSlugs
  dictionarySlugs?: DictionarySlugs
  bibliographySlugs?: BibliographySlugs
}): JSX.Element[] {
  return [
    // Signs Routes - wrapped in Library component
    <Route
      key="library-signDisplay"
      path="/reference-library/signs/:id"
      exact
      render={({ match }): ReactNode => (
        <Library>
          <HeadTagsService
            title="Cuneiform sign display: eBL"
            description="Detailed cuneiform sign information at the electronic Babylonian Library (eBL)."
          >
            <SignDisplay
              signService={signService}
              wordService={wordService}
              id={decodeURIComponent(match.params.id)}
            />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: signSlugs,
      })}
    />,
    <Route
      key="library-signs"
      path="/reference-library/signs"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Cuneiform sign search: eBL"
            description="Cuneiform signs search at the electronic Babylonian Library (eBL)."
          >
            <Signs {...props} signService={signService} />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && sitemapDefaults)}
    />,

    // Dictionary Routes - wrapped in Library component
    <Route
      key="library-wordEditor"
      path="/reference-library/dictionary/:id/edit"
      exact
      render={({ match }): ReactNode => (
        <Library>
          <WordEditor
            wordService={wordService}
            id={decodeURIComponent(match.params.id)}
          />
        </Library>
      )}
    />,
    <Route
      key="library-wordDisplay"
      path="/reference-library/dictionary/:id"
      exact
      render={({ match }): ReactNode => (
        <Library>
          <HeadTagsService
            title="Dictionary entry: eBL"
            description="electronic Babylonian Library (eBL) dictionary entry display"
          >
            <WordDisplay
              textService={textService}
              wordService={wordService}
              fragmentService={fragmentService}
              signService={signService}
              wordId={decodeURIComponent(match.params.id)}
            />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: dictionarySlugs,
      })}
    />,
    <Route
      key="library-dictionary"
      path="/reference-library/dictionary"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Search dictionary: eBL"
            description="Search the electronic Babylonian Library (eBL) dictionary"
          >
            <Dictionary wordService={wordService} {...props} />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && sitemapDefaults)}
    />,

    // Bibliography Routes - wrapped in Library component
    <Route
      key="library-bibliographyEditorNew"
      path="/reference-library/bibliography/references/new-reference"
      exact
      render={(props): ReactNode => (
        <Library>
          <BibliographyEditor
            bibliographyService={bibliographyService}
            {...props}
            create={true}
            match={{
              // eslint-disable-next-line react/prop-types
              ...props.match,
              params: { id: '' },
            }}
          />
        </Library>
      )}
    />,
    <Route
      key="library-bibliographyViewer"
      path="/reference-library/bibliography/references/:id"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Bibliography entry: eBL"
            description="Bibliography entry at the electronic Library (eBL)."
          >
            <BibliographyViewer
              bibliographyService={bibliographyService}
              {...props}
            />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: bibliographySlugs,
      })}
    />,
    <Route
      key="library-bibliographyEditor"
      path="/reference-library/bibliography/references/:id/edit"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Edit Bibliography entry: eBL"
            description="Edit bibliography entry at the electronic Library (eBL)."
          >
            <BibliographyEditor
              bibliographyService={bibliographyService}
              {...props}
            />
          </HeadTagsService>
        </Library>
      )}
    />,
    <Route
      key="library-bibliographyReferencesSearch"
      path="/reference-library/bibliography/references"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Bibliography References: eBL"
            description="Bibliography references search in the electronic Babylonian Library (eBL)."
          >
            <Bibliography
              bibliographyService={bibliographyService}
              afoRegisterService={afoRegisterService}
              fragmentService={fragmentService}
              {...props}
              activeTab={'references'}
            />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="library-bibliographyAfoRegisterSearch"
      path="/reference-library/bibliography/afo-register"
      exact
      render={(props): ReactNode => (
        <Library>
          <HeadTagsService
            title="Bibliography AfO-Register: eBL"
            description="AfO-Register search in the electronic Babylonian Library (eBL)."
          >
            <Bibliography
              bibliographyService={bibliographyService}
              afoRegisterService={afoRegisterService}
              fragmentService={fragmentService}
              {...props}
              activeTab={'afo-register'}
            />
          </HeadTagsService>
        </Library>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="library-bibliographyRedirect"
      path="/reference-library/bibliography"
      exact
      render={(): ReactNode => (
        <Redirect to="/reference-library/bibliography/afo-register" />
      )}
    />,

    // Default redirect to signs when accessing /reference-library
    <Route
      key="library-root"
      path="/reference-library"
      exact
      render={(): ReactNode => <Redirect to="/reference-library/signs" />}
    />,

    // Catch-all for unmatched library routes
    <Route
      key="library-notFound"
      path="/reference-library/*"
      render={(): ReactNode => (
        <Library>
          <NotFoundPage />
        </Library>
      )}
    />,
  ]
}
