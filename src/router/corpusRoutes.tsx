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
  textSlugs,
  chapterSlugs,
}: {
  sitemap: boolean
  textService: TextService
  fragmentService: FragmentService
  wordService: WordService
  bibliographyService: BibliographyService
  textSlugs?: TextSlugs
  chapterSlugs?: ChapterSlugs
}): JSX.Element[] {
  return [
    <Route
      key="ChapterEditView"
      path="/corpus/:genre/:category/:index/:stage/:chapter/edit"
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
      render={({ match, location }): ReactNode => (
        <ChapterView
          textService={textService}
          wordService={wordService}
          id={parseChapterId(match.params)}
          activeLine={decodeURIComponent(location.hash.replace(/^#/, ''))}
        />
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: chapterSlugs,
      })}
    />,
    <Route
      key="TextView"
      path="/corpus/:genre/:category/:index"
      render={({ match }): ReactNode => (
        <TextView
          textService={textService}
          fragmentService={fragmentService}
          id={parseTextId(match.params)}
        />
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: textSlugs,
      })}
    />,
    <Route
      key="Corpus"
      path="/corpus"
      render={(props): ReactNode => (
        <Corpus textService={textService} {...props} />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
    <Route
      key="CorpusByGenre"
      path="/corpus/:genre"
      render={({ match, ...props }): ReactNode => (
        <Corpus
          textService={textService}
          genre={match.params.genre}
          {...props}
        />
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
  ]
}
