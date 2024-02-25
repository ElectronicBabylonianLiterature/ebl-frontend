import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'

import BibliographyService from 'bibliography/application/BibliographyService'
import ChapterEditView from 'corpus/ui/ChapterEditView'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import ChapterView from 'corpus/ui/ChapterView'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageFromAbbreviation } from 'common/period'
import { TextId } from 'transliteration/domain/text-id'
import TextView from 'corpus/ui/TextView'
import Corpus, { genres } from 'corpus/ui/Corpus'
import { sitemapDefaults, ChapterSlugs, TextSlugs } from 'router/sitemap'
import MarkupService from 'markup/application/MarkupService'
import { HeadTagsService } from 'router/head'
import NotFoundPage from 'NotFoundPage'
function parseChapterId(params): ChapterId {
  return {
    textId: parseTextId(params),
    stage: decodeURIComponent(stageFromAbbreviation(params.stage)),
    name: decodeURIComponent(params.chapter),
  }
}

function parseTextId(params): TextId {
  return {
    genre: decodeURIComponent(params.genre),
    category: parseInt(decodeURIComponent(params.category)),
    index: parseInt(decodeURIComponent(params.index)),
  }
}

export default function CorpusRoutes({
  sitemap,
  textService,
  fragmentService,
  wordService,
  bibliographyService,
  markupService,
  textSlugs,
  chapterSlugs,
}: {
  sitemap: boolean
  textService: TextService
  fragmentService: FragmentService
  wordService: WordService
  bibliographyService: BibliographyService
  markupService: MarkupService
  textSlugs?: TextSlugs
  chapterSlugs?: ChapterSlugs
}): JSX.Element[] {
  return [
    <Route
      key="ChapterEditView"
      path="/corpus/:genre/:category/:index/:stage/:chapter/edit"
      exact
      render={({ match }): ReactNode => (
        <ChapterEditView
          textService={textService}
          bibliographyService={bibliographyService}
          fragmentService={fragmentService}
          wordService={wordService}
          id={parseChapterId(match.params)}
        />
      )}
    />,
    <Route
      key="ChapterView"
      path="/corpus/:genre/:category/:index/:stage/:chapter"
      exact
      render={({ match, location }): ReactNode => (
        <HeadTagsService
          title="Chapter display: eBL"
          description="Text Chapter in the electronic Babylonian Library (eBL) Corpus."
        >
          <ChapterView
            textService={textService}
            wordService={wordService}
            markupService={markupService}
            id={parseChapterId(match.params)}
            activeLine={decodeURIComponent(location.hash.replace(/^#/, ''))}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: chapterSlugs,
      })}
    />,
    <Route
      key="TextView"
      path="/corpus/:genre/:category/:index"
      exact
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="Text display: eBL"
          description="Text in the electronic Babylonian Library (eBL) Corpus."
        >
          <TextView
            textService={textService}
            fragmentService={fragmentService}
            id={parseTextId(match.params)}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: textSlugs,
      })}
    />,
    <Route
      key="Corpus"
      path="/corpus"
      exact
      render={(props): ReactNode => (
        <HeadTagsService
          title="Corpus catalogue: eBL"
          description="Catalogue of the electronic Babylonian Library (eBL) Corpus."
        >
          <Corpus textService={textService} {...props} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="CorpusByGenre"
      path="/corpus/:genre"
      exact
      render={({ match, history }): ReactNode => (
        <HeadTagsService
          title="Corpus catalogue: eBL"
          description="Catalogue of the electronic Babylonian Library (eBL) Corpus."
        >
          <Corpus
            textService={textService}
            genre={match.params.genre}
            history={history}
          />
        </HeadTagsService>
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: Object.values(genres).map((genre) => {
          return {
            genre: genre.genre,
          }
        }),
      })}
    />,
    <Route
      key="NotFoundCorpus"
      path="/corpus/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
